import { useState } from "react";
import "./styling/Register.css";

import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/authService";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: ""
    });

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        if (
            form.password !==
            form.confirm_password
        ) {

            setError(
                "Passwords do not match"
            );

            return;
        }

        try {

            setLoading(true);

            const result =
                await register(form);

            if (!result.success) {

                setError(
                    result.message
                );

                return;
            }

            setSuccess(
                "Registration successful. You can now login."
            );

            setTimeout(() => {

                navigate("/login");

            }, 1500);

        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to server"
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <h1>Create Account</h1>

            {error && (
                <p>{error}</p>
            )}

            {success && (
                <p>{success}</p>
            )}

            <form
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                  
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    
                />

                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                   
                />

                <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    value={
                        form.confirm_password
                    }
                    onChange={handleChange} 
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating Account..."
                        : "Register"}
                </button>

                <div className="auth-links-row" style={{ justifyContent: "center" }}>
                    <span style={{ color: "#71695f" }}>Already a registered client?</span>
                    <Link to="/login" className="auth-touch-link" style={{ fontWeight: 800 }}>
                        Sign In to Privé Salon
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

export default Register;