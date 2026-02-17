import { Navigate } from "react-router-dom";
import { client } from "../Config/supabase";
import { useEffect, useState } from "react";
import { Commet } from "react-loading-indicators";
import Swal from "sweetalert2";

const AdminRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await client.auth.getUser();

            // ❌ User not logged in → SweetAlert + redirect
            if (!user) {
                setLoading(false);
                Swal.fire({
                    icon: 'warning',
                    title: 'Login Required',
                    text: 'Please login first!',
                    confirmButtonColor: '#002a33'
                }).then(() => {
                    setRedirect(true);
                });
                return;
            }

            // ✅ User logged in → check role
            const { data: profile } = await client
                .from("hemhack-userdata")
                .select("role")
                .eq("user_id", user.id)
                .single();

            if (profile?.role === "admin") {
                setIsAdmin(true);
            } else {
                // ❌ Logged in but not admin → SweetAlert + redirect
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'You are not an admin!',
                    confirmButtonColor: '#002a33'
                }).then(() => {
                    setRedirect(true);
                });
            }

            setLoading(false);
        };

        checkAdmin();
    }, []);

    // ✅ Loader while checking
    if (loading)
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Commet
                    color="#002a33"
                    size="large"
                    text="Loading.."
                    textColor="#002a33"
                />
            </div>
        );

    // Redirect after SweetAlert
    if (redirect) return <Navigate to="/login" />;

    // ✅ Only admin can see children
    return children;
};

export default AdminRoute;
