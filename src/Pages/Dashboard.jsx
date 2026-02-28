import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import StatCard from "../Components/StatCard";
import { client } from "../Config/supabase";
import { ToastContainer, toast } from 'react-toastify';
import { FaUsers } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { IoBagRemove } from "react-icons/io5";
import { FaUserGraduate } from "react-icons/fa6";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../Components/Navbar";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("complaints");
    const [volunteers, setVolunteers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [lostFoundItems, setLostFoundItems] = useState([]);
    const [stats, setStats] = useState({
        users: 0,
        complaints: 0,
        volunteers: 0,
        lostfound: 0,
    });
    const [loading, setLoading] = useState(true);

    // ---------------- Fetch Data ----------------

    useEffect(() => {
        const fetchComplaints = async () => {
            const { data, error } = await client
                .from("complaints")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) setComplaints(data);
        };
        fetchComplaints();
    }, []);


    useEffect(() => {
        const fetchVolunteers = async () => {
            const { data, error } = await client
                .from("volunteers")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) setVolunteers(data);
        };
        fetchVolunteers();
    }, []);

    useEffect(() => {
        const fetchLostFound = async () => {
            const { data, error } = await client
                .from("lost_found_items")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) setLostFoundItems(data);
        };
        fetchLostFound();
    }, []);

    // ---------------- Functions ----------------
    const badgeColor = (status) => {
        if (status === "Pending") return "border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition duration-300";
        if (status === "In Progress") return "border border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white transition duration-300";
        if (status === "Resolved") return "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition duration-300";
        return "border border-gray-400 text-gray-700 hover:bg-gray-500 hover:text-white transition duration-300";
    };

    const updateStatus = async (id, status) => {
        console.log(status);

        try {
            await client
                .from("complaints")
                .update({ status })
                .eq("id", id);

            toast.success(`Complaint status updated to "${status}"!`);

        } catch {
            toast.error("Failed to update status");
        }
    };

    const badgeColor2 = (status) => {
        if (status === "Approved") return "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition duration-300";
        if (status === "Not Approved") return "border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition duration-300";
        return "border border-gray-400 text-gray-700 hover:bg-gray-500 hover:text-white transition duration-300";
    };

    const volUpdateStatus = async (id, volunStatus) => {
        console.log(volunStatus);

        try {
            await client
                .from("volunteers")
                .update({ status: volunStatus })
                .eq("id", id);

            toast.success(`volunteer status updated to "${volunStatus}"!`);

        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteVolunteer = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this volunteer?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            const { error } = await client.from("volunteers").delete().eq("id", id);

            if (error) {
                Swal.fire({ icon: "error", title: "Failed", text: error.message });
            } else {
                setVolunteers((prev) => prev.filter((v) => v.id !== id));
                Swal.fire({ icon: "success", title: "Deleted!", text: "Volunteer has been deleted.", timer: 2000, showConfirmButton: false });
            }
        }
    };

    const handleDeleteLost = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this list?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            const { error } = await client.from("lost_found_items").delete().eq("id", id);

            if (error) {
                Swal.fire({ icon: "error", title: "Failed", text: error.message });
            } else {
                setLostFoundItems((prev) => prev.filter((l) => l.id !== id));
                Swal.fire({ icon: "success", title: "Deleted!", text: "Volunteer has been deleted.", timer: 2000, showConfirmButton: false });
            }
        }
    };

    // ---------------- Stats ----------------
    const getCount = async (table) => {
        const { count, error } = await client
            .from(table)
            .select("*", { count: "exact", head: true });

        if (error) return 0;
        return count;
    };

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const users = await getCount("hemhack-userdata");
            const complaints = await getCount("complaints");
            const volunteers = await getCount("volunteers");
            const lostfound = await getCount("lost_found_items");
            setStats({ users, complaints, volunteers, lostfound });
            setLoading(false);
        };
        fetchStats();
    }, []);

    // ========Real time for complaint=======

    useEffect(() => {
        const channel = client
            .channel("complaints-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "complaints" },
                (payload) => {
                    if (payload.eventType === "UPDATE") {

                        setComplaints(prev => prev.map(item => item.id === payload.new.id ? payload.new : item))

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

    // =====Real time for volunteer =======
    useEffect(() => {
        const channel = client
            .channel("volunteers-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "volunteers" },
                (payload) => {
                    if (payload.eventType === "UPDATE") {

                        setVolunteers(prev => prev.map(item => item.id === payload.new.id ? payload.new : item))

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


    return (
        <div className="bg-white min-h-screen flex overflow-hidden">

            <div className="flex flex-col flex-1 w-full">
                <div>
                    <Navbar name="Admin Dashboard" showLogout />

                    {/* Stats Cards */}
                    <div className="p-4 sm:p-5 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <StatCard title="Total Users" value={loading ? "..." : stats.users} icons={<FaUsers size={35} />} />
                            <StatCard title="Complaints" value={loading ? "..." : stats.complaints} icons={<GoAlertFill size={35} />} />
                            <StatCard title="Lost & Found" value={loading ? "..." : stats.lostfound} icons={<IoBagRemove size={35} />} />
                            <StatCard title="Volunteer" value={loading ? "..." : stats.volunteers} icons={<FaUserGraduate size={35} />} />
                        </div>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex gap-3 px-4 sm:px-6 mt-6">
                        <button
                            onClick={() => setActiveTab("complaints")}
                            className={`px-4 py-2 rounded-xl font-semibold ${activeTab === "complaints" ? "bg-[#003b46] text-white" : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Complaints
                        </button>
                        <button
                            onClick={() => setActiveTab("volunteers")}
                            className={`px-4 py-2 rounded-xl font-semibold ${activeTab === "volunteers" ? "bg-[#003b46] text-white" : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Volunteers
                        </button>
                        <button
                            onClick={() => setActiveTab("lostfound")}
                            className={`px-4 py-2 rounded-xl font-semibold ${activeTab === "lostfound" ? "bg-[#003b46] text-white" : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Lost & Found
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-5">
                        {/* Complaints */}
                        {activeTab === "complaints" && (
                            <div className="bg-white shadow shadow-[#003b46] mb-6 mt-3 mx-4 sm:mx-6 rounded-2xl overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-600 uppercase">
                                        <tr>
                                            <th className="p-3 font-serif rounded-tl-2xl">id</th>
                                            <th className="p-3 font-serif">Category</th>
                                            <th className="p-3 font-serif">Description</th>
                                            <th className="p-3 font-serif">Status</th>
                                            <th className="p-3 font-serif">Campus</th>
                                            <th className="p-3 font-serif rounded-tr-2xl">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaints.map((c, index) => (
                                            <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-100">
                                                <td className="p-3 text-gray-600 font-medium">{index + 1}</td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm font-serif font-medium">{c.category}</td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm font-serif font-medium">{c.description}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 lg:px-5 py-1 truncate lg:py-2.5 rounded-sm lg:rounded-lg border text-[8px] lg:text-sm font-serif font-bold ${badgeColor(c.status)}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600 font-medium">
                                                    <button className="px-2 lg:px-5 py-1 truncate lg:py-2.5 rounded-sm lg:rounded-lg border text-[8px] lg:text-sm  font-serif border-blue-500 text-blue-500 font-bold hover:bg-blue-500 hover:text-white cursor-pointer transition duration-300">
                                                        {c.campus}</button>
                                                </td>
                                                <td className="p-3">
                                                    <select
                                                        value={c.status}
                                                        onChange={(e) => updateStatus(c.id, e.target.value)}
                                                        className="border text-[6px] md:text-sm text-[#003b46] font-medium border-gray-200 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                                                    >
                                                        <option>Submitted</option>
                                                        <option >Pending</option>
                                                        <option >In Progress</option>
                                                        <option>Resolved</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Volunteers */}
                        {activeTab === "volunteers" && (
                            <div className="bg-white shadow shadow-[#003b46] mt-3 mb-6 mx-4 sm:mx-6 rounded-2xl overflow-x-auto p-4">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
                                        <tr>
                                            <th className="p-3 font-serif rounded-tl-2xl">ID</th>
                                            <th className="p-3 font-serif">Image</th>
                                            <th className="p-3 font-serif">Name</th>
                                            <th className="p-3 font-serif truncate">Roll No</th>
                                            <th className="p-3 font-serif">Event</th>
                                            <th className="p-3 font-serif">Availability</th>
                                            <th className="p-3 font-serif">Status</th>
                                            <th className="p-3 font-serif rounded-tr-2xl">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {volunteers.map((v, index) => (
                                            <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-100 transition">
                                                <td className="p-3">{index + 1}</td>
                                                <td className="p-3 text-gray-600 font-medium">
                                                    <img className="rounded-full shadow-sm md:w-14 w-10 lg:h-14 h-10" src={v.image} alt="" />
                                                </td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm font-medium">{v.name}</td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm truncate font-medium">{v.roll}</td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm font-medium">{v.event}</td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm font-medium">{v.availability}</td>
                                                <td className="p-3 text-gray-600 text-[8px] md:text-sm font-medium">
                                                    <span className={`px-2 lg:px-5 py-1 truncate lg:py-2.5 rounded-sm lg:rounded-lg border text-[8px] lg:text-sm font-serif font-bold ${badgeColor2(v.status)}`}>
                                                        {v.status}
                                                    </span>
                                                </td>
                                                <td className="pt-5 text-gray-600 text-[8px] md:text-sm font-medium justify-center flex items-center gap-2">
                                                    <select
                                                        value={v.status}
                                                        onChange={(e) => volUpdateStatus(v.id, e.target.value)}
                                                        className="border text-[6px] lg:py-2.5 md:text-sm text-[#003b46] font-medium border-gray-200 rounded-sm lg:rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                                                    >
                                                        <option>Submitted</option>
                                                        <option >Approved</option>
                                                        <option >Not Approved</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleDeleteVolunteer(v.id)}
                                                        className="px-2 lg:px-5 py-1 truncate lg:py-2.5 rounded-sm lg:rounded-lg border text-[8px] lg:text-sm  font-serif border-red-600 text-red-600 font-bold hover:bg-red-600 hover:text-white cursor-pointer transition duration-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>



                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Lost & Found */}
                        {activeTab === "lostfound" && (
                            <div className="bg-white shadow shadow-[#003b46] mt-3 mb-6 mx-4 sm:mx-6 rounded-2xl overflow-x-auto p-4">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
                                        <tr>
                                            <th className="p-3 font-serif rounded-tl-2xl">Id</th>
                                            <th className="p-3 font-serif">Image</th>
                                            <th className="p-3 font-serif">Title</th>
                                            <th className="p-3 font-serif">Description</th>
                                            <th className="p-3 font-serif">Type</th>
                                            <th className="p-3 font-serif">Capmus</th>
                                            <th className="p-3 font-serif">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lostFoundItems.map((item, index) => (
                                            <tr key={item.id} className="border border-gray-200 hover:bg-gray-100 transition">
                                                <td className="p-3">{index + 1}</td>
                                                <td className="p-3">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.title} className="md:w-16 w-10 md:h-16 h-10 object-cover rounded-xl" />
                                                    ) : "-"}
                                                </td>
                                                <td className="p-3 font-semibold text-[8px] md:text-sm truncate text-gray-600">{item.title}</td>
                                                <td className="p-3 font-semibold text-[8px] md:text-sm text-gray-600">{item.description}</td>
                                                <td className="p-3 font-semibold text-gray-600">
                                                    <span className={`px-2 lg:px-5 py-1 lg:py-2.5 rounded-sm lg:rounded-lg font-bold text-[8px] lg:text-sm  font-serif capitalize border ${item.type === "lost" ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer transition duration-300" : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white cursor-pointer transition duration-300"
                                                        }`}>
                                                        {item.type}
                                                    </span>

                                                </td>
                                                <td className="p-3 font-semibold text-gray-600">
                                                    <button className="px-2 lg:px-5 py-1 truncate lg:py-2.5 rounded-sm lg:rounded-lg border text-[8px] lg:text-sm  font-serif border-blue-500 text-blue-500 font-bold hover:bg-blue-500 hover:text-white cursor-pointer transition duration-300">
                                                        {item.campus}</button>
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => handleDeleteLost(item.id)}
                                                        className="px-2 lg:px-5 py-1 truncate lg:py-2.5 rounded-sm lg:rounded-lg border text-[8px] lg:text-sm  font-serif border-red-600 text-red-600 font-bold hover:bg-red-600 hover:text-white cursor-pointer transition duration-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <ToastContainer
                        position="top-right"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            </div>
        </div>
    );
}
