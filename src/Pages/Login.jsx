import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { IoLogoGithub } from "react-icons/io";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { client } from "../Config/supabase";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const themedAlert = Swal.mixin({
        customClass: {
            popup: 'swal2-popup',
            title: 'swal2-title',
            htmlContainer: 'swal2-html-container',
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel',
        },
        buttonsStyling: false,
    });

    // ================= EMAIL LOGIN =================
    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            themedAlert.fire({
                icon: "error",
                title: "Fields Required",
                html: "Please enter both email and password.",
            });
            return;
        }

        setLoading(true);

        const { data, error } = await client.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        setLoading(false);

        if (error) {
            themedAlert.fire({
                icon: "error",
                title: "Login Failed",
                html: error.message,
            });
            return;
        }

        const user = data.user;

        const { data: profile, error: roleError } = await client
            .from("hemhack-userdata")
            .select("role")
            .eq("user_id", user.id)
            .single();

        if (roleError || !profile) {
            themedAlert.fire({
                icon: "error",
                title: "Role Error",
                html: "User role not found",
            });
            return;
        }

        themedAlert.fire({
            icon: "success",
            title: "Login Successful",
            html: "Welcome Back!",
        }).then(() => {
            profile.role === "admin"
                ? navigate("/dashboard")
                : navigate("/home");
        });
    };

    // ================= GOOGLE LOGIN =================
    const handleGoogleLogin = async () => {
        try {
            const { error } = await client.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + "/oauth-callback",
                },
            });
            if (error) throw error;
        } catch (err) {
            themedAlert.fire({
                icon: "error",
                title: "Google Login Failed",
                html: err.message,
            });
        }
    };

    // ================= GITHUB LOGIN =================
    const handleGithubLogin = async () => {
        try {
            const { error } = await client.auth.signInWithOAuth({
                provider: "github",
                options: {
                    redirectTo: window.location.origin + "/oauth-callback",
                },
            });
            if (error) throw error;
        } catch (err) {
            themedAlert.fire({
                icon: "error",
                title: "Github Login Failed",
                html: err.message,
            });
        }
    };

    // ✅ RETURN JSX INSIDE COMPONENT
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-xl bg-white p-6 rounded-3xl border border-gray-200 shadow-lg shadow-[#003b46] transition duration-500 hover:scale-[1.02]">
                <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
                    Welcome Back!
                </h1>
                <p className="text-sm capitalize text-gray-600 mb-6">
                    Please enter log in details below
                </p>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your mail"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="text-right">
                        <button className="text-sm font-medium text-[#003b46] hover:underline">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-[#003b46] text-white py-3 rounded-lg font-bold cursor-pointer transition duration-500 hover:bg-[#002a33] hover:scale-[1.03]"
                    >
                        {loading ? "Logging in..." : "Log in"}
                    </button>

                    <div className="relative text-center">
                        <span className="bg-white px-3 text-sm text-gray-400">Or</span>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-bold transition duration-500 hover:bg-[#003b46] hover:text-white hover:scale-[1.05]"
                        >
                            <FaGoogle />
                            Google
                        </button>

                        <button
                            type="button"
                            onClick={handleGithubLogin}
                            className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-bold transition duration-500 hover:bg-[#003b46] hover:text-white hover:scale-[1.05]"
                        >
                            <IoLogoGithub />
                            Github
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Don&apos;t have an account?{" "}
                        <Link to="/" className="text-[#003b46] font-semibold">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;





