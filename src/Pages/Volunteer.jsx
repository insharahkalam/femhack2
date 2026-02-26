import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../Components/Navbar";
import { client } from "../Config/supabase";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";

const Volunteer = () => {
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    event: "",
    availability: "",
    image: null,
  });
  const events = ["Hackathon", "Devathon", "Bootcamp", "Entry Test"];
  const availability = ["1–2 hours", "3–5 hours", "5+ hours", "Flexible"];

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);


  useEffect(() => {
    const getUser = async () => {
      const { data } = await client.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);
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
    if (!user) return;
    const { data, error } = await client
      .from("volunteers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setVolunteers(data);
  };

  useEffect(() => {
    if (user) fetchVolunteers();
  }, [user]);

  // img upload========

  const uploadImage = async () => {
    if (!formData.image) return null;

    const fileExt = formData.image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await client.storage
      .from("volunteer-img")
      .upload(fileName, formData.image);

    if (error) {
      console.error(error);
      return null;
    }

    const { data } = client.storage
      .from("volunteer-img")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };


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

      const imageUrl = await uploadImage();


      if (editingId) {

        // Update volunteer
        const { error } = await client
          .from("volunteers")
          .update({
            name: formData.name,
            roll: formData.roll,
            event: formData.event,
            availability: formData.availability,
            image: imageUrl,
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
          .insert([{ ...formData, user_id: user.id, image: imageUrl, }]);

        if (error) throw error;

        themedAlert.fire({
          icon: "success",
          title: "Registered!",
          html: "Volunteer registered successfully.",
        });
      }

      setFormData({ name: "", event: "", availability: "", roll: "", image: null });
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
      roll: v.roll,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                <input
                  type="text"
                  placeholder="Enter your roll number"
                  value={formData.roll}
                  onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                  className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                  >
                    {formData.event || "Select events"}
                    <IoMdArrowDropdown className="text-gray-500 text-lg" />
                  </button>
                  {open && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-gray-100 shadow-lg overflow-hidden">
                      {events.map((event) => (
                        <div
                          key={event}
                          onClick={() => {
                            setFormData({ ...formData, event });
                            setOpen(false);
                          }}
                          className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[#003b46]/10"
                        >
                          {event}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpen2(!open2)}
                    className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                  >
                    {formData.availability || "Select Availability"}
                    <IoMdArrowDropdown className="text-gray-500 text-lg" />
                  </button>
                  {open2 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-gray-100 shadow-lg overflow-hidden">
                      {availability.map((availability) => (
                        <div
                          key={availability}
                          onClick={() => {
                            setFormData({ ...formData, availability });
                            setOpen2(false);
                          }}
                          className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[#003b46]/10"
                        >
                          {availability}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
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
                  <th className="p-3 font-serif">Photo</th>
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
                    <td className="p-3">
                      {v.image ? (
                        <img src={v.image} alt={v.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        "No Image"
                      )}
                    </td>
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
