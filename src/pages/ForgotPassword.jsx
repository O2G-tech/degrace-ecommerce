import { useState } from "react";

import { forgotPassword } from "../services/authService";

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

            const result =
                await forgotPassword(email);

            console.log(
                "FORGOT PASSWORD RESPONSE:",
                result
            );

            setMessage(
                result.message
            );

            if (
                result.success &&
                result.data?.reset_token
            ) {

                setToken(
                    result.data.reset_token
                );
            }

        } catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to process request"
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div style={{ padding: "40px" }}>

            <h1>Forgot Password</h1>

            <form
                onSubmit={handleSubmit}
            >

                <input
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Processing..."
                        : "Reset Password"}
                </button>

            </form>

            {message && (
                <p>{message}</p>
            )}

            {token && (
                <div>

                    <h3>
                        Development Reset Token
                    </h3>

                    <p>
                        {token}
                    </p>

                </div>
            )}

        </div>
    );
}

export default ForgotPassword;