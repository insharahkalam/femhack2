import { useEffect, useState } from "react";
import { client } from "../Config/supabase";
import Navbar from "../Components/Navbar";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

const AllLostFoundItems = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((i) =>
  i.title.toLowerCase().includes(search.toLowerCase())
);

console.log(filteredItems);

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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the item!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const { error } = await client
        .from("lost_found_items")
        .delete()
        .eq("id", id);

      if (!error) {
        Swal.fire("Deleted!", "Item has been deleted.", "success");
        fetchItems();
      } else {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };

  return (
    <>
      <Navbar name="Lost & Found Items" back inputt search={search} setSearch={setSearch} />

      <div className="min-h-screen flex justify-center bg-gray-50 p-6">
        <div className="overflow-x-auto w-full max-w-6xl bg-white  rounded-3xl shadow-lg shadow-[#003b46]">

          {filteredItems.length === 0 ? (
            <p className="text-[#003b46] text-center font-bold text-3xl font-serif capitalize py-6">No items found  </p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-[#003b46] uppercase text-sm font-serif">
                <tr>
                  <th className="p-6">Id</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((i, index) => (
                  <tr key={i.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="p-6 font-bold text-gray-700">{index + 1}:</td>
                    <td className="p-3 font-medium font-serif text-gray-700 capitalize">{i.title}</td>

                    <td className="py-3">
                      {i.image_url ? (
                        <img
                          src={i.image_url}
                          alt={i.title}
                          className="w-16 h-16 object-cover rounded-xl shadow-lg"
                        />
                      ) : (
                        <span className="text-gray-400  text-sm">No image</span>
                      )}
                    </td>

                    <td className="p-3 max-w-xs font-serif text-gray-700 truncate">{i.description}</td>

                    {/* Type Badge */}
                    <td className="py-3">
                      <span className={`px-5 py-2.5 rounded-lg font-bold font-serif capitalize border ${i.type === "lost" ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer transition duration-300" : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white cursor-pointer transition duration-300"
                        }`}>
                        {i.type}
                      </span>
                    </td>

                    {/* Campus Badge */}
                    <td className="py-3">
                      <span className="px-5 py-2.5 rounded-lg border font-serif border-blue-500 text-blue-500 font-bold hover:bg-blue-500 hover:text-white cursor-pointer transition duration-300">
                        {i.campus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="items-center pt-7 flex gap-2">
                      <button
                        className="bg-red-600 flex items-center gap-1 text-white px-4 py-2 hover:bg-red-700 rounded-lg transition"
                        onClick={() => handleDelete(i.id)}
                      >
                        <MdDelete /> Delete
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

export default AllLostFoundItems;
