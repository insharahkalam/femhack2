import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { client } from "../Config/supabase";
import Navbar from "../Components/Navbar";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";
const Complaints = () => {
    const [formData, setFormData] = useState({ category: "", description: "", campus: "" });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [myComplaints, setMyComplaints] = useState([]);
    const [editingId, setEditingId] = useState(null); // for editing
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    const campuses = ["Aliabad", "Gulshan", "Numaish", "Paposh", "Bahadurabad", "Zaitoon Ashraf"];

    const badgeColor = (status) => {
        if (status === "Pending") return "border border-yellow-800 text-yellow-700";
        if (status === "In Progress") return "border border-blue-700 text-blue-700";
        if (status === "Resolved") return "border border-green-800 text-green-700";
        return "border border-gray-700 text-gray-600";
    };

    useEffect(() => {
        const channel = client
            .channel("complaints-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "complaints" },
                (payload) => {
                    if (payload.eventType === "UPDATE") {

                        setMyComplaints(prev => prev.map(item => item.id === payload.new.id ? payload.new : item))

                    }
                    // if (payload.eventType === "INSERT") {
                    //     setComplaints(prev => [{ ...payload.new }, ...prev]);
                    // }
                    // if (payload.eventType === "DELETE") {
                    //     setComplaints(prev => prev.filter(c => c.id !== Number(payload.old.id)));
                    // }
                }
            )
            .subscribe();

        return () => channel.unsubscribe()
    }, []);


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
                        campus: formData.campus,
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
                        campus: formData.campus,
                        status: "submitted",
                    },
                ]);

                if (error) throw error;

                themedAlert.fire({
                    icon: "success",
                    title: "Complaint Submitted",
                    html: "Your complaint has been successfully submitted.",
                });
            }

            setFormData({ category: "", description: "", campus: "" });
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
        setFormData({ category: c.category, description: c.description, campus: c.campus });
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
            <Navbar name="Complaints" showBackToHome />
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


                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpen2(!open2)}
                                    className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                                >
                                    {formData.category || "Select Category"}
                                    <IoMdArrowDropdown className="text-gray-500 text-lg" />
                                </button>

                                {open2 && (
                                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-gray-100 shadow-lg overflow-hidden">
                                        {["Cleaning", "Maintenance", "Security", "Other"].map(
                                            (category) => (
                                                <div
                                                    key={category}
                                                    onClick={() => {
                                                        setFormData({ ...formData, category });
                                                        setOpen2(false);
                                                    }}
                                                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[#003b46]/10"
                                                >
                                                    {category}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* Campus */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpen(!open)}
                                    className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                                >
                                    {formData.campus || "Select campus"}
                                    <IoMdArrowDropdown className="text-gray-500 text-lg" />
                                </button>
                                {open && (
                                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-gray-100 shadow-lg overflow-hidden">
                                        {campuses.map((campus) => (
                                            <div
                                                key={campus}
                                                onClick={() => {
                                                    setFormData({ ...formData, campus });
                                                    setOpen(false);
                                                }}
                                                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[#003b46]/10"
                                            >
                                                {campus}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                <div className="overflow-x-auto w-full bg-white rounded-3xl shadow-md shadow-[#003b46]">
                    <h2 className="text-3xl font-serif font-bold  py-4 ps-6  text-[#003b46]">My Complaints</h2>

                    {myComplaints.length === 0 ? (
                        <p className="text-gray-500 pb-4 ps-6  text-lg">No complaints submitted yet.</p>
                    ) : (
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
                                <tr>
                                    <th className="ps-8 font-serif rounded-tl-xl">ID</th>
                                    <th className="p-3 font-serif">Category</th>
                                    <th className="p-3 font-serif">Description</th>
                                    <th className="p-3 font-serif">Status</th>
                                    <th className="p-3 font-serif">Campus</th>
                                    <th className="p-3 font-serif rounded-tr-xl">Action</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white">
                                {myComplaints.map((c, index) => (
                                    <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-100 transition">
                                        <td className="ps-8 font-medium text-gray-700">{index + 1}:</td>
                                        <td className="p-3 text-gray-700 text-[10px] md:text-sm">{c.category}</td>
                                        <td className="p-3 text-gray-700 text-[10px] md:text-sm">{c.description}</td>
                                        <td className="p-3 text-[10px] md:text-sm">
                                            <button className={`px-3 py-1 text-[10px] md:text-sm  truncate transition duration-500 hover:scale-105 rounded-sm text-xs cursor-pointer font-medium ${badgeColor(c.status)}`}>
                                                {c.status}
                                            </button>
                                        </td>
                                        <td className="p-3 text-gray-500 text-sm">
                                            <button className="border px-3  text-[10px] md:text-sm py-0.5 transition duration-500 hover:scale-105 text-blue-500 rounded cursor-pointer ">
                                                {c.campus}</button>
                                        </td>
                                        <td className="p-3 truncate space-x-1 space-y-1">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className=" text-blue-500 text-lg px-2 py-1 duration-500 hover:scale-105 rounded-sm border border-blue-600 transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className=" border border-red-500 text-red-500 text-lg px-2 py-1 rounded-sm transition duration-500 hover:scale-105"
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
