import { useState } from "react";

import { updateProfile } from "../../services/authService";

const PROFILE_KEY = "admin_profile";

function getStoredProfile() {

    try {
        return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    } catch {
        return {};
    }
}

function AdminSettings() {

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const storedProfile = getStoredProfile();

    const [form, setForm] = useState({
        name: storedProfile.name || user.name || "",
        phone: storedProfile.phone || user.phone || ""
    });
    const [profileImage, setProfileImage] = useState(
        storedProfile.profileImage || ""
    );
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        orderAlerts: storedProfile.orderAlerts !== false,
        reviewAlerts: storedProfile.reviewAlerts !== false
    });

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
            setMessage("Choose an image smaller than 2 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setProfileImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const result = await updateProfile(form);

            if (!result.success) {
                setMessage(result.message || "Failed to update profile");
                return;
            }

            const updatedUser = { ...user, ...form };
            const updatedProfile = { ...form, profileImage, ...preferences };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
            setMessage("Profile settings saved successfully.");

        } catch (error) {
            console.error("ADMIN PROFILE ERROR:", error);
            setMessage("Unable to save profile settings.");

        } finally {
            setSaving(false);
        }
    };

    const handlePreferenceChange = (event) => {
        const nextPreferences = {
            ...preferences,
            [event.target.name]: event.target.checked
        };

        setPreferences(nextPreferences);
        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify({ ...form, profileImage, ...nextPreferences })
        );
    };

    return (

        <div>

            <h1>
                Settings
            </h1>

            <div className="admin-settings-grid">

                <section className="admin-form-card admin-profile-card">
                    <div className="admin-profile-heading">
                        {profileImage ? (
                            <img src={profileImage} alt="Administrator profile" />
                        ) : (
                            <span>{(form.name || "A").charAt(0).toUpperCase()}</span>
                        )}
                        <div>
                            <h2>{form.name || "Administrator"}</h2>
                            <p>{user.role || "Administrator"}</p>
                        </div>
                    </div>

                    <label className="admin-upload-label">
                        Profile picture
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                        />
                    </label>

                    <form onSubmit={handleSubmit} className="admin-settings-form">
                        <label>
                            Full name
                            <input name="name" value={form.name} onChange={handleChange} required />
                        </label>

                        <label>
                            Email address
                            <input type="email" value={user.email || ""} disabled />
                        </label>

                        <label>
                            Phone number
                            <input name="phone" value={form.phone} onChange={handleChange} />
                        </label>

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save profile"}
                        </button>
                    </form>

                    {message && <p className="admin-settings-message">{message}</p>}
                </section>

                <section className="admin-form-card admin-preferences-card">
                    <h2>Preferences</h2>
                    <p>Choose which updates appear in your admin workspace.</p>

                    <label className="admin-toggle">
                        <input
                            type="checkbox"
                            name="orderAlerts"
                            checked={preferences.orderAlerts}
                            onChange={handlePreferenceChange}
                        />
                        <span>New order alerts</span>
                    </label>

                    <label className="admin-toggle">
                        <input
                            type="checkbox"
                            name="reviewAlerts"
                            checked={preferences.reviewAlerts}
                            onChange={handlePreferenceChange}
                        />
                        <span>Review alerts</span>
                    </label>

                    <div className="admin-account-details">
                        <h3>Account details</h3>
                        <p><strong>Role:</strong> {user.role || "Administrator"}</p>
                        <p><strong>Account email:</strong> {user.email || "Not available"}</p>
                    </div>
                </section>
            </div>

        </div>
    );
}

export default AdminSettings;