import { useEffect, useState, type ReactNode } from "react";
import type { IAuthUser, LoginData } from "../../interfaces/auth";
import { AuthContext } from "./AuthContext";
import { loginUser, getUser, logoutUser } from "../../services/authService";


export default function AuthProvider({children}: {children: ReactNode}) {
    const [authUser, setAuthUser] = useState<IAuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    async function login(loginData: LoginData) {
        const user = await loginUser(loginData);        
        user.id = user.pk;
        setAuthUser(user);
    }

    async function logout() {
        await logoutUser();
        setAuthUser(null);
    }

    useEffect(() => {
        getUser()
        .then((user) => {
            user.id = user.pk;
            setAuthUser(user);
        })
        .catch(() => setAuthUser(null))
        .finally(() => setLoading(false));
    }, []);

    return(
        <AuthContext.Provider value={{ authUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}