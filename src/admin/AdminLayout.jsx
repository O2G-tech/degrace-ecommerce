import { Outlet } from "react-router-dom";

import AdminSidebar
    from "./components/AdminSidebar";

import AdminNavbar
    from "./components/AdminNavbar";

function AdminLayout() {

    const isAdmin =
        localStorage.getItem("isAdmin");

    if (isAdmin !== "true") {

        window.location.href =
            "/admin/login";

        return null;
    }

    return (

        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <AdminNavbar />

                <main className="admin-content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default AdminLayout;