import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext/AuthContext";

export default function ProtectedRoutes () {
    const { authUser, loading } = useAuth();

    if(loading) {
        return <div>Loading...</div>
    }

    return authUser ? <Outlet /> : <Navigate to="/login" replace />;
}