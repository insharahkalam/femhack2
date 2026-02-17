import { BrowserRouter, Routes, Route } from "react-router-dom"
import Signup from "../Pages/Signup"
import ErrorPage from "../Pages/ErrorPage"
import Login from "../Pages/Login"
import OAuthCallback from "../Components/OAuthCallback"
import Lost_Found from "../Pages/Lost_Found"
import Dashboard from "../Pages/Dashboard"
import Complaints from "../Pages/Complaints"
import Volunteer from "../Pages/Volunteer"
import ProtectedRoute from "../Components/ProtectedRoute"
import AdminRoute from "../Components/AdminRoute";
import Home from "../Pages/Home"

const Routing = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<AdminRoute> <Dashboard /></AdminRoute>} />
                    <Route path="/home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
                    <Route path="/lostFounud" element={<Lost_Found />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/volunteer" element={<Volunteer />} />
                    <Route path="/oauth-callback" element={<OAuthCallback />} />
                    <Route path="*" element={<ErrorPage />} />

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default Routing