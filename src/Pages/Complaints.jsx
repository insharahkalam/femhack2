import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { client } from "../Config/supabase";
import Navbar from "../Components/Navbar";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const Complaints = () => {
    const [formData, setFormData] = useState({ category: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [myComplaints, setMyComplaints] = useState([]);
    const [editingId, setEditingId] = useState(null); // for editing

    const badgeColor = (status) => {
        if (status === "Pending") return "bg-yellow-100 text-yellow-700";
        if (status === "In Progress") return "bg-blue-100 text-blue-700";
        if (status === "Resolved") return "bg-green-100 text-green-700";
        return "bg-gray-100 text-gray-600";
    };

    useEffect(() => {
        const init = async () => {
            const { data } = await client.auth.getUser();
            if (!data?.user) return;
            setUser(data.user);
            await fetchMyComplaints(data.user.id);
        };
        init();
    }, []);

    const fetchMyComplaints = async (uid) => {
        const { data, error } = await client
            .from("complaints")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });

        if (!error) setMyComplaints(data);
    };

    const themedAlert = Swal.mixin({
        customClass: {
            popup: "swal2-popup",
            title: "swal2-title",
            htmlContainer: "swal2-html-container",
            confirmButton: "swal2-confirm",
        },
        buttonsStyling: false,
    });

    const handleSubmit = async () => {
        if (!formData.category || !formData.description) {
            return themedAlert.fire({
                icon: "error",
                title: "Fields Required",
                html: "Please select category and enter description.",
            });
        }
        if (!user) {
            return themedAlert.fire({
                icon: "error",
                title: "Not Logged In",
                html: "Please login first.",
            });
        }

        try {
            setLoading(true);

            if (editingId) {
                // Edit existing complaint
                const { error } = await client
                    .from("complaints")
                    .update({
                        category: formData.category,
                        description: formData.description,
                    })
                    .eq("id", editingId);

                if (error) throw error;

                themedAlert.fire({
                    icon: "success",
                    title: "Complaint Updated",
                    html: "Your complaint has been updated.",
                });
                setEditingId(null);
            } else {
                // Insert new complaint
                const { error } = await client.from("complaints").insert([
                    {
                        user_id: user.id,
                        category: formData.category,
                        description: formData.description,
                        status: "Pending",
                    },
                ]);

                if (error) throw error;

                themedAlert.fire({
                    icon: "success",
                    title: "Complaint Submitted",
                    html: "Your complaint has been successfully submitted.",
                });
            }

            setFormData({ category: "", description: "" });
            fetchMyComplaints(user.id);
        } catch (err) {
            themedAlert.fire({
                icon: "error",
                title: "Failed",
                html: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({ category: c.category, description: c.description });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const result = await themedAlert.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this complaint?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            const { error } = await client.from("complaints").delete().eq("id", id);

            if (error) {
                themedAlert.fire({
                    icon: "error",
                    title: "Failed",
                    html: error.message,
                });
            } else {
                setMyComplaints((prev) => prev.filter((c) => c.id !== id));
                themedAlert.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Complaint has been deleted.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        }
    };

    return (
        <>
            <Navbar name="Complaints" btn = 'Back To Home'/>
            <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-5 lg:p-10 space-y-10">

                {/* Submit/Edit Complaint Form */}
                <div className="w-full max-w-xl bg-white p-6 rounded-3xl border border-gray-200 shadow-lg shadow-[#003b46] transition transform hover:scale-[1.02] duration-500">
                    <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
                        {editingId ? "Edit Complaint" : "Submit Complaint"}
                    </h1>
                    <p className="text-sm capitalize text-gray-600 mb-6">
                        {editingId ? "Update your complaint below" : "Report your issue below"}
                    </p>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                            >
                                <option value="">Select Category</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Security">Security</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                rows="4"
                                placeholder="Describe your issue..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-[#003b46] text-white py-3 rounded-lg font-bold cursor-pointer transition duration-500 hover:bg-[#002a33] hover:scale-[1.03]"
                        >
                            {loading ? (editingId ? "Updating..." : "Submitting...") : editingId ? "Update Complaint" : "Submit Complaint"}
                        </button>
                    </form>
                </div>

                {/* My Complaints Table */}
                <div className="overflow-x-auto w-full p-6 bg-white rounded-3xl shadow-md shadow-[#003b46]">
                    <h2 className="text-3xl font-serif font-bold text-[#003b46] mb-6">My Complaints</h2>

                    {myComplaints.length === 0 ? (
                        <p className="text-gray-500 text-lg">No complaints submitted yet.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
                                <tr>
                                    <th className="p-3 font-serif rounded-tl-xl">ID</th>
                                    <th className="p-3 font-serif">Category</th>
                                    <th className="p-3 font-serif">Description</th>
                                    <th className="p-3 font-serif">Status</th>
                                    <th className="p-3 font-serif">Time</th>
                                    <th className="p-3 font-serif rounded-tr-xl">Action</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white">
                                {myComplaints.map((c, index) => (
                                    <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-100 transition">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">{c.category}</td>
                                        <td className="p-3 font-medium">{c.description}</td>
                                        <td className="p-3">
                                            <span className={`px-3 py-1 rounded-sm text-xs font-medium ${badgeColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500 text-sm">
                                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </td>
                                        <td className="p-3 space-x-1 space-y-1">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="bg-blue-500 text-white text-lg px-3 py-1 rounded-sm hover:bg-blue-600 transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="bg-red-500 text-white text-lg px-3 py-1 rounded-sm hover:bg-red-600 transition"
                                            >
                                                <MdDelete />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </>
    );
};

export default Complaints;
