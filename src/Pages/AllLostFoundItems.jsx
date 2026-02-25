// import { useEffect, useState } from "react";
// import { client } from "../Config/supabase";
// import Navbar from "../Components/Navbar";
// import { MdDelete } from "react-icons/md";
// import Swal from "sweetalert2";


// const AllLostFoundItems = () => {
//     const [items, setItems] = useState([]);


//     const fetchItems = async () => {
//         const { data, error } = await client
//             .from("lost_found_items")
//             .select("*")
//             .order("created_at", { ascending: false });
//         if (!error) setItems(data);
//     };

//     useEffect(() => {
//         fetchItems();
//     }, []);

//     const handleDelete = async (id) => {
//         const result = await Swal.fire({
//             icon: "warning",
//             title: "Are you sure?",
//             text: "This will permanently delete the item!",
//             showCancelButton: true,
//             confirmButtonText: "Yes, delete it!",
//             cancelButtonText: "Cancel",
//         });

//         if (result.isConfirmed) {
//             const { error } = await client
//                 .from("lost_found_items")
//                 .delete()
//                 .eq("id", id);

//             if (!error) {
//                 Swal.fire("Deleted!", "Item has been deleted.", "success");
//                 fetchItems(); // refresh the list
//             } else {
//                 Swal.fire("Error!", error.message, "error");
//             }
//         }
//     };


//     return (
//         <>
//             <Navbar name="Lost & Found Items" back />

//             <div className="min-h-screen flex justify-center bg-gray-50 p-6">
//                 <div className="overflow-x-auto w-full max-w-5xl bg-white p-6 rounded-3xl shadow-lg shadow-[#003b46]">
//                     {items.length === 0 ? (
//                         <p className="text-gray-500">No items reported yet.</p>
//                     ) : (
//                         <table className="w-full text-sm text-left">
//                             <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
//                                 <tr>
//                                     <th className="p-3">#</th>
//                                     <th className="p-3">Title</th>
//                                     <th className="p-3">Image</th>
//                                     <th className="p-3">Description</th>
//                                     <th className="p-3">Type</th>
//                                     <th className="p-3">Campus</th>
//                                     <th className="p-3">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {items.map((i, index) => (
//                                     <tr key={i.id} className="border-b hover:bg-gray-50">
//                                         <td className="p-3">{index + 1}</td>
//                                         <td className="p-3 font-medium">{i.title}</td>

//                                         <td className="p-3">
//                                             {i.image_url && (
//                                                 <img
//                                                     src={i.image_url}
//                                                     alt={i.title}
//                                                     className="w-14 h-14 object-cover rounded"
//                                                 />
//                                             )}
//                                         </td>

//                                         <td className="p-3">{i.description}</td>

//                                         <td className="p-3 flex gap-2">
//                                             <button className="bg-red-600 flex items-center gap-1 text-white px-6 py-2 hover:bg-red-700 cursor-pointer rounded-lg" >{i.type}
//                                             </button>
//                                         </td>

//                                         <td className="p-3 flex gap-2">

//                                             <button
//                                                 className="bg-red-600 flex items-center gap-1 text-white px-6 py-2 hover:bg-red-700 cursor-pointer rounded-lg"

//                                             >
//                                                 {i.campus}
//                                             </button>
//                                         </td>

//                                         <td className="p-3 flex gap-2">

//                                             <button
//                                                 className="bg-red-600 flex items-center gap-1 text-white px-6 py-2 hover:bg-red-700 cursor-pointer rounded-lg"
//                                                 onClick={() => handleDelete(i.id)}
//                                             >
//                                                 <MdDelete /> Delete
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default AllLostFoundItems;



import { useEffect, useState } from "react";
import { client } from "../Config/supabase";
import Navbar from "../Components/Navbar";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

const AllLostFoundItems = () => {
  const [items, setItems] = useState([]);

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
      <Navbar name="Lost & Found Items" back />

      <div className="min-h-screen flex justify-center bg-gray-50 p-6">
        <div className="overflow-x-auto w-full max-w-6xl bg-white p-6 rounded-3xl shadow-lg shadow-[#003b46]">

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No items reported yet.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, index) => (
                  <tr key={i.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{i.title}</td>

                    <td className="p-3">
                      {i.image_url ? (
                        <img
                          src={i.image_url}
                          alt={i.title}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </td>

                    <td className="p-3 max-w-xs truncate">{i.description}</td>

                    {/* Type Badge */}
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-sm text-white text-xs ${
                        i.type === "lost" ? "bg-red-500" : "bg-green-500"
                      }`}>
                        {i.type}
                      </span>
                    </td>

                    {/* Campus Badge */}
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-sm bg-blue-500 text-white text-xs">
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
