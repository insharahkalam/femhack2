import Navbar from '../Components/Navbar'
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return (
        <>

            <div className="h-screen flex items-center flex-col bg-gray-100">
                <Navbar name="Home" showLogout />
                <div className="max-w-6xl w-full px-6 mx-auto pt-15 ">

                    <h1 className="text-4xl font-serif font-semibold text-[#003b46] text-center mb-15">
                        Saylani Mass IT Hub
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Complaints */}
                        <div
                            onClick={() => navigate("/complaints")}
                            className="cursor-pointer bg-white border h-50 border-gray-200 rounded-3xl p-8 shadow-lg shadow-[#003b46] transition duration-500 hover:scale-[1.05]"
                        >
                            <h2 className="text-3xl font-serif font-bold text-[#003b46] mb-3">
                                Complaints
                            </h2>
                            <p className="text-gray-600 font-serif text-lg">
                                Submit campus related complaints like electricity, internet or maintenance.
                            </p>
                        </div>

                        {/* Lost & Found */}
                        <div
                            onClick={() => navigate("/lostFounud")}
                            className="cursor-pointer bg-white border h-50 border-gray-200 rounded-3xl p-8 shadow-lg shadow-[#003b46] transition duration-500 hover:scale-[1.05]"
                        >
                            <h2 className="text-3xl font-serif font-bold text-[#003b46] mb-3">
                                Lost & Found
                            </h2>
                            <p className="text-gray-600 font-serif text-lg">
                                Report lost items or help return found belongings.
                            </p>
                        </div>

                        {/* Volunteer */}
                        <div
                            onClick={() => navigate("/volunteer")}
                            className="cursor-pointer bg-white border h-50 border-gray-200 rounded-3xl p-8 shadow-lg shadow-[#003b46] transition duration-500 hover:scale-[1.05]"
                        >
                            <h2 className="text-3xl font-serif font-bold text-[#003b46] mb-3">
                                Volunteer
                            </h2>
                            <p className="text-gray-600 font-serif text-lg">
                                Register yourself as a volunteer for Saylani events.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        

        </>
    )
}

export default Home