import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("isAdmin");

        navigate("/admin/login");
    };

    return (

        <aside className="admin-sidebar">

            <div className="admin-logo">
                DE-GRACE ADMIN
            </div>

            <nav>

                <NavLink to="/admin">
                    📊 Dashboard
                </NavLink>

                <NavLink to="/admin/products">
                    📦 Products
                </NavLink>

                <NavLink to="/admin/categories">
                    🗂 Categories
                </NavLink>

                <NavLink to="/admin/orders">
                    🛒 Orders
                </NavLink>

                <NavLink to="/admin/customers">
                    👥 Customers
                </NavLink>

                <NavLink to="/admin/payments">
                    💳 Payments
                </NavLink>

                <NavLink to="/admin/reviews">
                    ⭐ Reviews
                </NavLink>

                <NavLink to="/admin/reports">
                    📈 Reports
                </NavLink>

                <NavLink to="/admin/settings">
                    ⚙ Settings
                </NavLink>

            </nav>

            <button
                className="admin-logout"
                onClick={logout}
            >
                🚪 Logout
            </button>

        </aside>
    );
}

export default AdminSidebar;