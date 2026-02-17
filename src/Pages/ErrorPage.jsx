import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ErrorPage = () => {
    return (
        <>

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div
                    className="w-full max-w-xl bg-white p-10 rounded-3xl
                   border border-gray-200
                   shadow-lg shadow-[#003b46]
                   text-center
                   transition duration-500 hover:scale-[1.02]"
                >

                    <h1 className="text-7xl font-extrabold text-[#003b46] mb-6">
                        404
                    </h1>

                    <h2 className="text-3xl font-serif font-semibold text-gray-500 mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-gray-700 mb-8 text-lg font-serif leading-relaxed">
                        Oops! The page you are looking for does not exist or has been moved.
                        Let’s get you back on track.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/home"
                            className="flex items-center justify-center gap-2
                       bg-[#003b46] text-white
                       px-6 py-3 rounded-lg font-bold
                       transition duration-500
                       hover:bg-[#002a33] hover:scale-[1.03]"
                        >
                            <FaArrowLeft className="mt-1" />
                            Go Home
                        </Link>

                    </div>
                </div>
            </div>



        </>
    )
}

export default ErrorPage