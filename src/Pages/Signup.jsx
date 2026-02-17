import Swal from "sweetalert2";
import { IoLogoGithub } from "react-icons/io";
import { FaGoogle } from "react-icons/fa6";
import { useState , useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { client } from "../Config/supabase";

const Signup = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await client.auth.getSession();
            if (data.session) {
                navigate("/dashboard");
            }
        };
        checkUser();
    }, [navigate]);


    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        profileImage: null,
    });
    const [loading, setLoading] = useState(false);

    // ================= SWEETALERT THEME =================

    const themedAlert = Swal.mixin({ customClass: { popup: 'swal2-popup', title: 'swal2-title', htmlContainer: 'swal2-html-container', confirmButton: 'swal2-confirm', cancelButton: 'swal2-cancel', }, buttonsStyling: false, });

    // ================= EMAIL SIGNUP =================

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.profileImage) {
            themedAlert.fire({
                icon: "error",
                title: "All Fields Required",
                html: "Please fill in all fields and select a profile image.",
            });
            return;
        }

        setLoading(true);

        try {
            // ✅ STEP 1: SIGNUP FIRST
            const { data, error } = await client.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            const user = data.user; // ✅ AB user defined hai

            // ✅ STEP 2: IMAGE UPLOAD
            const fileExt = formData.profileImage.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await client.storage
                .from("femhack_Profile-img")
                .upload(fileName, formData.profileImage);

            if (uploadError) throw uploadError;

            const { data: publicData } = client.storage
                .from("femhack_Profile-img")
                .getPublicUrl(fileName);

            const profileImageUrl = publicData.publicUrl;

            // ✅ STEP 3: INSERT INTO TABLE
            const { error: insertError } = await client
                .from("hemhack-userdata")
                .insert([
                    {
                        user_id: user.id,
                        name: formData.name,
                        email: formData.email,
                        profile_pic: profileImageUrl,
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (insertError) throw insertError;

            setLoading(false);

            themedAlert
                .fire({
                    icon: "success",
                    title: "Account Created!",
                    html: "Your account has been successfully registered. You can now login.",
                })
                .then(() => navigate("/login"));

        } catch (err) {
            setLoading(false);
            themedAlert.fire({
                icon: "error",
                title: "Signup Failed",
                html: err.message,
            });
        }
    };

    // ================= GOOGLE LOGIN =================
    const handleGoogleLogin = async () => {
        try {
            const { error } = await client.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + "/oauth-callback"
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

    return (
        <div className="min-h-screen flex items-center m-5 bg-gray-50 justify-center">
            <div className="w-full shadow-lg transition duration-500 hover:scale-102 shadow-[#003b46] max-w-xl bg-white p-5 rounded-3xl border border-gray-200">
                <h1 className="text-3xl font-serif capitalize font-semibold text-gray-900 mb-4">
                    Create an account
                </h1>

                <form className="space-y-4" onSubmit={handleSignup}>
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                        />
                    </div>

                    {/* Email */}
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
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                        />
                    </div>

                    {/* Password */}
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
                                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#003b46]"
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

                    {/* Profile Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setFormData({ ...formData, profileImage: e.target.files[0] })
                            }
                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#003b46]"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#003b46] text-white py-3 rounded-lg
            font-bold duration-500 hover:scale-103 cursor-pointer mt-6
            hover:bg-[#002a33] transition"
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>

                    {/* Divider */}
                    <div className="relative text-center">
                        <span className="bg-white px-3 text-sm text-gray-400">Or</span>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex-1 flex items-center font-bold justify-center gap-2
              border rounded-lg py-3 text-sm cursor-pointer
              hover:bg-[#003b46] hover:text-white transition duration-500 hover:scale-105"
                        >
                            <FaGoogle />
                            Google
                        </button>

                        <button
                            type="button"
                            onClick={handleGithubLogin}
                            className="flex-1 flex items-center font-bold justify-center gap-2
              border rounded-lg py-3 text-sm cursor-pointer
              hover:bg-[#003b46] hover:text-white transition duration-500 hover:scale-105"
                        >
                            <IoLogoGithub />
                            Github
                        </button>
                    </div>

                    {/* Login */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#003b46] font-semibold">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
