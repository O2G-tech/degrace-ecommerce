import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminService";

function AdminLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const result = await adminLogin(
                email,
                password
            );

            if (!result.success) {

                setError(
                    result.message || "Login failed"
                );

                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(result.data.user)
            );

            localStorage.setItem(
                "isAdmin",
                "true"
            );

            navigate("/admin");

        } catch (error) {

            console.error(
                "ADMIN LOGIN ERROR:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="admin-login">

            <div className="admin-login-card">

                <h1>Admin Login</h1>

                <p>
                    Sign in to your administrator account
                </p>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        autoComplete="username"
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"
                        }
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;