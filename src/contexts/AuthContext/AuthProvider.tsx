import { useEffect, useState, type ReactNode } from "react";
import type { IAuthUser, LoginData } from "../../interfaces/auth";
import { AuthContext } from "./AuthContext";
import { login as loginApi, getUser, logout as logoutApi } from "../../services/authService";


export default function AuthProvider({children}: {children: ReactNode}) {
    const [authUser, setAuthUser] = useState<IAuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    async function login(loginData: LoginData) {
        const user = await loginApi(loginData);
        setAuthUser(user);
    }

    async function logout() {
        await logoutApi();
        setAuthUser(null);
    }

    useEffect(() => {
        getUser()
        .then((user) => {
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