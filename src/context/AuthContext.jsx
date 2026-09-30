import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    logout as logoutUser
} from "../services/authService";

const AuthContext = createContext();
const AUTH_SESSION_KEY = "degrace_authenticated";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (localStorage.getItem(AUTH_SESSION_KEY) !== "true" && localStorage.getItem("jumia_authenticated") !== "true") {
            setLoading(false);
            return;
        }

        checkUser();

    }, []);

    const checkUser = async () => {

        try {

            const result =
                await getCurrentUser();

            if (result.success) {

                setUser(result.data);

            } else {

                localStorage.removeItem(AUTH_SESSION_KEY);

            }

        } catch (error) {

            setUser(null);
            localStorage.removeItem(AUTH_SESSION_KEY);

        } finally {

            setLoading(false);
        }
    };


    const loginUser = (authData) => {
        let actualUser = authData;
        let token = authData?.token || authData?.session_id;

        if (authData && authData.user) {
            actualUser = authData.user;
        }

        if (token) {
            localStorage.setItem("degrace_token", token);
        }

        setUser(actualUser);
        localStorage.setItem(AUTH_SESSION_KEY, "true");
        if (actualUser) {
            localStorage.setItem("degrace_user", JSON.stringify(actualUser));
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            localStorage.removeItem(AUTH_SESSION_KEY);
            localStorage.removeItem("degrace_token");
            localStorage.removeItem("token");
            localStorage.removeItem("degrace_user");
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginUser,
                logout,
                checkUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    return useContext(AuthContext);
}