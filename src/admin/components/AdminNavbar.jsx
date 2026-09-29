function AdminNavbar() {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const profile = JSON.parse(
        localStorage.getItem("admin_profile") || "{}"
    );

    return (

        <header className="admin-navbar">

            <div>
                <h2>
                    Admin Dashboard
                </h2>
            </div>

            <div className="admin-user">

                {profile.profileImage ? (
                    <img
                        className="admin-user-avatar"
                        src={profile.profileImage}
                        alt="Administrator profile"
                    />
                ) : (
                    <span className="admin-user-avatar admin-user-initial">
                        {(user.name || "A").charAt(0).toUpperCase()}
                    </span>
                )}

                <span>
                    {user.name || "Administrator"}
                </span>

            </div>

        </header>
    );
}

export default AdminNavbar;