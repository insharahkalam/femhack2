import { Commet } from "react-loading-indicators";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../Config/supabase";

const OAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const goHome = async () => {
            const { data: { user } } = await client.auth.getUser();

            if (!user) {
                navigate("/login");
                return;
            }

            // ✅ OAuth login → HOME
            navigate("/home");
        };

        goHome();
    }, []);

    return <div
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
    </div>;
};

export default OAuthCallback;
