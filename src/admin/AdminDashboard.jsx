import { useEffect, useState } from "react";

import {
    getAdminDashboard,
    getAdminReports
} from "../services/adminService";
import SalesChart from "./components/SalesChart";

function AdminDashboard() {

    const [data, setData] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [sales, setSales] = useState([]);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [result, reportResult] =
                    await Promise.all([
                        getAdminDashboard(),
                        getAdminReports("30")
                    ]);

                if (!result.success) {

                    setError(
                        result.message
                    );

                    return;
                }

                setData(result.data);

                if (reportResult.success) {
                    setSales(reportResult.data?.daily_sales || []);
                }

            } catch (error) {

                console.error(error);

                setError(
                    "Failed to load dashboard"
                );

            } finally {

                setLoading(false);
            }
        };

        loadDashboard();

    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (

        <div>

            <h1>
                Dashboard
            </h1>

            <div className="admin-stat-grid">

                <div className="admin-stat-card">
                    <h3>Products</h3>
                    <strong>
                        {data.products}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <h3>Categories</h3>
                    <strong>
                        {data.categories}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <h3>Customers</h3>
                    <strong>
                        {data.customers}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <h3>Orders</h3>
                    <strong>
                        {data.orders}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <h3>Pending Orders</h3>
                    <strong>
                        {data.pending_orders}
                    </strong>
                </div>

                <div className="admin-stat-card">
                    <h3>Total Revenue</h3>
                    <strong>
                        ₦
                        {Number(
                            data.revenue
                        ).toLocaleString()}
                    </strong>
                </div>

            </div>

            <div className="admin-report-card">
                <h2>Sales Trend · Last 30 Days</h2>
                <SalesChart sales={sales} />
            </div>

        </div>
    );
}

export default AdminDashboard;