import Swal from "sweetalert2";
import Navbar from "../Components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../Config/supabase";
import { IoMdArrowDropdown } from "react-icons/io";

const LostFound = () => {
  // states
  const [formData, setFormData] = useState({ title: "", description: "", campus: "", type: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const navigate = useNavigate();

  // dropdown items
  const item = [
    { label: "Lost Item", value: "lost" },
    { label: "Found Item", value: "found" },
  ];
  const campuses = ["Aliabad", "Gulshan", "Numaish", "Paposh", "Bahadurabad", "Zaitoon Ashraf"];

  // sweetalert config
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

      // Upload image if selected
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

      // Insert new item
      const { error } = await client.from("lost_found_items").insert([
        {
          title: formData.title,
          description: formData.description,
          campus: formData.campus,
          type: formData.type,
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

      // Clear form after submit
      setFormData({ title: "", description: "", campus: "", type: "" });
      setImage(null);
      navigate("/lostFound");

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

  return (
    <>
      <Navbar name="Lost & Found" showBackToHome showLost />

      <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
        <div className="w-full max-w-xl bg-white p-6 rounded-3xl border border-gray-200 shadow-lg shadow-[#003b46] transition transform hover:scale-[1.02] duration-500">

          {/* Heading */}
          <h1 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
            Report Lost Item
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Report your lost item below
          </p>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

            {/* Row 1: Title + Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="Enter item title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* Row 2: Campus + Item Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

              {/* Item Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpen2(!open2)}
                    className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                  >
                    {formData.type ? item.find((i) => i.value === formData.type)?.label : "Select item type"}
                    <IoMdArrowDropdown className="text-gray-500 text-lg" />
                  </button>
                  {open2 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-gray-100 shadow-lg overflow-hidden">
                      {item.map((it) => (
                        <div
                          key={it.value}
                          onClick={() => {
                            setFormData({ ...formData, type: it.value });
                            setOpen2(false);
                          }}
                          className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[#003b46]/10"
                        >
                          {it.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows="4"
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#003b46] text-white py-3 rounded-xl font-bold transition duration-300 hover:bg-[#002a33] hover:scale-[1.03]"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LostFound;
