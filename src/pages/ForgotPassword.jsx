import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import "./styling/Register.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setToken("");

        try {
            setLoading(true);
            const result = await forgotPassword(email);

            setMessage(result.message || "Password reset instructions generated.");

            if (result.success && result.data?.reset_token) {
                setToken(result.data.reset_token);
            }
        } catch (error) {
            console.error("FORGOT PASSWORD ERROR:", error);
            setMessage(error.response?.data?.message || "Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <h1>Reset Secret Password</h1>

            {message && (
                <p>{message}</p>
            )}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Client Email Address"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "SEARCHING ARCHIVES..." : "SEND RESET DIRECTIVE"}
                </button>

                {token && (
                    <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(197, 160, 89, 0.15)", borderRadius: "6px", border: "1px solid var(--boutique-gold)" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "var(--boutique-gold)", marginBottom: "0.4rem" }}>
                            Development Passkey:
                        </h3>
                        <p style={{ wordBreak: "break-all", fontSize: "0.85rem", margin: 0 }}>
                            {token}
                        </p>
                    </div>
                )}

                <div className="auth-links-row" style={{ justifyContent: "center" }}>
                    <Link to="/login" className="auth-touch-link">
                        ← Return to Client Sign In
                    </Link>
                </div>

                <div className="auth-return-home">
                    <Link to="/">
                        ← Return to DE-GRACE Home Editorial
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;