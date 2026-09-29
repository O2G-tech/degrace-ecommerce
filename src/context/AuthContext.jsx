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


    const loginUser = (userData) => {

        setUser(userData);
        localStorage.setItem(AUTH_SESSION_KEY, "true");
    };


    const logout = async () => {

        try {

            await logoutUser();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            setUser(null);
            localStorage.removeItem(AUTH_SESSION_KEY);
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