import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../Components/Navbar";
import { client } from "../Config/supabase";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Volunteer = () => {
  const [formData, setFormData] = useState({
    name: "",
    event: "",
    availability: "",
  });
  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const themedAlert = Swal.mixin({
    customClass: {
      popup: "swal2-popup",
      title: "swal2-title",
      htmlContainer: "swal2-html-container",
      confirmButton: "swal2-confirm",
    },
    buttonsStyling: false,
  });

  // Fetch volunteers from Supabase
  const fetchVolunteers = async () => {
    const { data, error } = await client
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setVolunteers(data);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // Submit or Update
  const handleSubmit = async () => {
    if (!formData.name || !formData.event || !formData.availability) {
      return themedAlert.fire({
        icon: "error",
        title: "Fields Required",
        html: "Please fill all fields.",
      });
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update volunteer
        const { error } = await client
          .from("volunteers")
          .update({
            name: formData.name,
            event: formData.event,
            availability: formData.availability,
          })
          .eq("id", editingId);

        if (error) throw error;

        themedAlert.fire({
          icon: "success",
          title: "Updated!",
          html: "Volunteer information updated successfully.",
        });
        setEditingId(null);
      } else {
        // Insert new volunteer
        const { error } = await client
          .from("volunteers")
          .insert([formData]);

        if (error) throw error;

        themedAlert.fire({
          icon: "success",
          title: "Registered!",
          html: "Volunteer registered successfully.",
        });
      }

      setFormData({ name: "", event: "", availability: "" });
      fetchVolunteers();
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

  // Edit volunteer
  const handleEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      name: v.name,
      event: v.event,
      availability: v.availability,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete volunteer
  const handleDelete = async (id) => {
    const result = await themedAlert.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this volunteer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const { error } = await client.from("volunteers").delete().eq("id", id);

      if (error) {
        themedAlert.fire({
          icon: "error",
          title: "Failed",
          html: error.message,
        });
      } else {
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        themedAlert.fire({
          icon: "success",
          title: "Deleted!",
          text: "Volunteer has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <>
      <Navbar name="Volunteer" showBackToHome />
      <div className="min-h-screen m-5 lg:m-0 flex flex-col items-center bg-gray-50 space-y-10">

        {/* Registration / Edit Form */}
        <div className="w-full mt-10 max-w-xl bg-white p-6 rounded-3xl border border-gray-200 shadow-lg shadow-[#003b46] transition duration-500 hover:scale-[1.02]">
          <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
            {editingId ? "Edit Volunteer" : "Volunteer Registration"}
          </h1>
          <p className="text-sm capitalize text-gray-600 mb-6">
            {editingId ? "Update volunteer information" : "Register yourself for upcoming events"}
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
              <input
                type="text"
                placeholder="Enter event name"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <input
                type="text"
                placeholder="e.g. Weekends / Full Day"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#003b46] text-white py-3 rounded-lg font-bold cursor-pointer transition duration-500 hover:bg-[#002a33] hover:scale-[1.03]"
            >
              {loading ? (editingId ? "Updating..." : "Registering...") : editingId ? "Update Volunteer" : "Register Now"}
            </button>
          </form>
        </div>

        {/* Volunteers Table */}
        <div className="overflow-x-auto mb-10 w-full max-w-4xl p-6 bg-white rounded-3xl shadow-md shadow-[#003b46]">
          <h2 className="text-3xl font-serif font-bold text-[#003b46] mb-6">Volunteers</h2>
          {volunteers.length === 0 ? (
            <p className="text-gray-500 text-lg">No volunteers registered yet.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
                <tr>
                  <th className="p-3 font-serif rounded-tl-xl">ID</th>
                  <th className="p-3 font-serif">Name</th>
                  <th className="p-3 font-serif">Event</th>
                  <th className="p-3 font-serif">Availability</th>
                  <th className="p-3 font-serif rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v, index) => (
                  <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{v.name}</td>
                    <td className="p-3">{v.event}</td>
                    <td className="p-3">{v.availability}</td>
                    <td className="p-3 space-x-2 space-y-1">
                      <button
                        onClick={() => handleEdit(v)}
                        className="bg-blue-500 text-white text-lg px-3 py-1 rounded-sm hover:bg-blue-600 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
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

export default Volunteer;
