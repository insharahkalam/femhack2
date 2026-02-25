import { Link, useNavigate } from "react-router-dom";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { client } from "../Config/supabase";
import { LuLogOut } from "react-icons/lu";
import Swal from "sweetalert2";
import { useState } from "react";


const Navbar = ({ showLost, showBackToHome, search, setSearch, back, inputt, name, showLogout = false }) => {

    const [open, setOpen] = useState(true)


    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await client.auth.signOut();
            Swal.fire({
                icon: "success",
                title: "Logged Out",
                html: "You have successfully logged out.",
                confirmButtonColor: "#003b46",
            }).then(() => navigate("/login"));
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Logout Failed",
                html: err.message,
                confirmButtonColor: "#003b46",
            });
        }
    };


    return (
        <nav className="w-full bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between">

            <h2 className="text-3xl font-serif font-bold text-[#003b46]">
                {name}
            </h2>

            <div className="flex items-center gap-4">
                {showBackToHome && (
                    <Link to={'/home'}>
                        <button

                            className="flex bg-[#003b46] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#002a33] transition duration-500 hover:scale-105 items-center gap-2"
                        >
                            <FaLongArrowAltLeft className="mt-0.5" />  Back To Home
                        </button></Link>
                )}

                <div className="flex items-center gap-4">
                    {inputt && (
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items by title..." className="border border-[#002a33] px-5 py-2.5 rounded-full w-100" />
                    )}

                    {back && (
                        <Link to={'/lostFounud'}>
                            <button

                                className="flex bg-[#003b46] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#002a33] transition duration-500 hover:scale-105 items-center gap-2"
                            >
                                <FaLongArrowAltLeft className="mt-0.5" />  Back
                            </button></Link>
                    )}
                </div>

                {showLost && (
                    <Link to={'/LostFound'}>
                        <button

                            className="flex bg-[#003b46] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#002a33] transition duration-500 hover:scale-105 items-center gap-2"
                        >
                            View Lost & Found
                        </button></Link>
                )}
            </div>


            {showLogout && (
                <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className=" text-white px-10 py-3 ms-3 rounded-lg font-bold font-serif  bg-[#002a33] transition duration-500 hover:scale-105 flex items-center gap-2"
                >
                    Logout <LuLogOut className="mt-1" />
                </button>

            )}


        </nav>
    );
};

export default Navbar;
