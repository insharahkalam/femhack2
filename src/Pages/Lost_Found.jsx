import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../Components/Navbar";
import { client } from "../Config/supabase";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const LostFound = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
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

  // Fetch lost & found items
  const fetchItems = async () => {
    const { data, error } = await client
      .from("lost_found_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Submit or Update
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      return themedAlert.fire({
        icon: "error",
        title: "Fields Required",
        html: "Please enter title and description.",
      });
    }

    try {
      setLoading(true);
      let imageUrl = "";

      if (image) {
        const fileName = `${Date.now()}_${image.name}`;
        const { error: uploadError } = await client.storage
          .from("lost-items")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data } = client.storage
          .from("lost-items")
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      if (editingId) {
        // Update item
        const { error } = await client
          .from("lost_found_items")
          .update({
            title: formData.title,
            description: formData.description,
            ...(imageUrl && { image_url: imageUrl }),
          })
          .eq("id", editingId);

        if (error) throw error;

        themedAlert.fire({
          icon: "success",
          title: "Updated!",
          html: "Lost & Found item updated successfully.",
        });
        setEditingId(null);
      } else {
        // Insert new item
        const { error } = await client.from("lost_found_items").insert([
          {
            title: formData.title,
            description: formData.description,
            image_url: imageUrl,
            status: "Pending",
          },
        ]);
        if (error) throw error;

        themedAlert.fire({
          icon: "success",
          title: "Submitted!",
          html: "Lost & Found item posted successfully.",
        });
      }

      setFormData({ title: "", description: "" });
      setImage(null);
      fetchItems();
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

  // Edit item
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ title: item.title, description: item.description });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete item
  const handleDelete = async (id) => {
    const result = await themedAlert.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const { error } = await client
        .from("lost_found_items")
        .delete()
        .eq("id", id);

      if (error) {
        themedAlert.fire({ icon: "error", title: "Failed", html: error.message });
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id));
        themedAlert.fire({
          icon: "success",
          title: "Deleted!",
          text: "Item has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <>
      <Navbar name="Lost & Found" />

      <div className="min-h-screen m-5 lg:m-0 flex flex-col items-center bg-gray-50 space-y-10">

        {/* Form */}
        <div className="w-full max-w-xl bg-white mt-10 p-6 rounded-3xl border border-gray-200 shadow-lg shadow-[#003b46] transition duration-500 hover:scale-[1.02]">
          <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
            {editingId ? "Edit Lost Item" : "Report Lost Item"}
          </h1>
          <p className="text-sm capitalize text-gray-600 mb-6">
            {editingId ? "Update the item information" : "Report your lost item below"}
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Title</label>
              <input
                type="text"
                placeholder="Enter item title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows="4"
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (Optional)</label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#003b46] text-white py-3 rounded-lg font-bold cursor-pointer transition duration-500 hover:bg-[#002a33] hover:scale-[1.03]"
            >
              {loading ? (editingId ? "Updating..." : "Submitting...") : editingId ? "Update Item" : "Submit Report"}
            </button>
          </form>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto w-full mb-10 max-w-4xl p-6 bg-white rounded-3xl shadow-md shadow-[#003b46]">
          <h2 className="text-3xl font-serif font-bold text-[#003b46] mb-6">My Lost & Found Items</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-lg">No items reported yet.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm">
                <tr>
                  <th className="p-3 font-serif rounded-tl-xl">ID</th>
                  <th className="p-3 font-serif">Title</th>
                  <th className="p-3 font-serif">Description</th>
                  <th className="p-3 font-serif">Image</th>
                  <th className="p-3 font-serif rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, index) => (
                  <tr key={i.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{i.title}</td>
                    <td className="p-3">{i.description}</td>
                    <td className="p-3">
                      {i.image_url && (
                        <img src={i.image_url} alt={i.title} className="w-16 h-16 object-cover rounded" />
                      )}
                    </td>
                    <td className="p-3 space-x-2 space-y-1">
                      <button
                        onClick={() => handleEdit(i)}
                        className="bg-blue-500 text-white text-lg px-3 py-1 rounded-sm hover:bg-blue-600 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
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

export default LostFound;
