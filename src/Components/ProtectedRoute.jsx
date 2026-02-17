import { Navigate } from "react-router-dom";
import { client } from "../Config/supabase";
import { useEffect, useState } from "react";
import { Commet } from "react-loading-indicators";
import Swal from "sweetalert2";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await client.auth.getUser();

      if (!data.user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please login first!',
          confirmButtonColor: '#002a33'
        }).then(() => {
          setRedirect(true);
        });
      } else {
        setUser(data.user);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

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
          text="Loading..."
          textColor="#002a33"
        />
      </div>
    );


  if (!user && redirect) return <Navigate to="/login" />;

  return children;
}
