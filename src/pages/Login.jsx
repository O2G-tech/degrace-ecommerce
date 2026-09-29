import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./styling/Register.css";

function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            const result = await login(form);

            if (!result.success) {
                setError(result.message || "Invalid credentials provided.");
                return;
            }

            loginUser(result.data);
            navigate("/account");
        } catch (error) {
            console.error(error);
            setError("Unable to connect to boutique server. Please verify backend is running in htdocs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <h1>Client Sign In</h1>

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Client Email Address"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Secret Password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "AUTHENTICATING..." : "ENTER PRIVÉ SALON"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", fontSize: "0.88rem" }}>
                    <Link to="/forgot-password" style={{ color: "var(--boutique-gold)", textDecoration: "none" }}>
                        Forgot Password?
                    </Link>
                    <span>
                        New client? <Link to="/register" style={{ color: "var(--boutique-gold)", fontWeight: 700 }}>Apply for Membership</Link>
                    </span>
                </div>

                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <Link to="/" style={{ color: "#71695f", fontSize: "0.85rem", textDecoration: "none" }}>
                        ← Return to DE-GRACE Home Editorial
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Login;