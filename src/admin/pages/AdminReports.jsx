import { useEffect, useState } from "react";

import { getAdminReports } from "../../services/adminService";
import SalesChart from "../components/SalesChart";

function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString()}`;
}

function AdminReports() {

    const [period, setPeriod] = useState("30");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadReport = async () => {

            try {

                setLoading(true);
                setError("");

                const result = await getAdminReports(period);

                if (!result.success) {
                    setError(result.message || "Failed to load reports");
                    return;
                }

                setReport(result.data);

            } catch (requestError) {

                console.error("ADMIN REPORTS ERROR:", requestError);
                setError("Failed to load reports");

            } finally {

                setLoading(false);

            }
        };

        loadReport();

    }, [period]);

    if (loading) {
        return <p>Loading reports...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const summary = report.summary;

    return (

        <div>

            <div className="admin-page-header">
                <div>
                    <h1>Reports</h1>
                    <p>Monitor sales, orders, customers, and inventory.</p>
                </div>

                <label>
                    Reporting period
                    <select
                        value={period}
                        onChange={(event) => setPeriod(event.target.value)}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="all">All time</option>
                    </select>
                </label>
            </div>

            <div className="admin-stat-grid">
                <div className="admin-stat-card">
                    <h3>Revenue</h3>
                    <strong>{formatCurrency(summary.revenue)}</strong>
                </div>
                <div className="admin-stat-card">
                    <h3>Orders</h3>
                    <strong>{summary.total_orders}</strong>
                </div>
                <div className="admin-stat-card">
                    <h3>Average Order</h3>
                    <strong>{formatCurrency(summary.average_order_value)}</strong>
                </div>
                <div className="admin-stat-card">
                    <h3>Customers</h3>
                    <strong>{summary.customers}</strong>
                </div>
                <div className="admin-stat-card">
                    <h3>Delivered Revenue</h3>
                    <strong>{formatCurrency(summary.delivered_revenue)}</strong>
                </div>
                <div className="admin-stat-card">
                    <h3>Low Stock</h3>
                    <strong>{report.inventory.low_stock}</strong>
                </div>
            </div>

            <div className="admin-report-card">
                <h2>Revenue Trend</h2>
                <SalesChart sales={report.daily_sales} />
            </div>

            <div className="admin-report-card">

                <h2>Order Status</h2>

                {report.status_breakdown.length === 0 ? (
                    <p>No orders in this period.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.status_breakdown.map((item) => (
                                <tr key={item.status}>
                                    <td>{item.status}</td>
                                    <td>{item.order_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="admin-report-card">
                <h2>Top Selling Products</h2>

                {report.top_products.length === 0 ? (
                    <p>No sales in this period.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Units Sold</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.top_products.map((product) => (
                                <tr key={product.product_id}>
                                    <td>{product.product_name}</td>
                                    <td>{product.units_sold}</td>
                                    <td>{formatCurrency(product.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="admin-report-card">
                <h2>Daily Sales</h2>

                {report.daily_sales.length === 0 ? (
                    <p>No sales in this period.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Orders</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.daily_sales.map((day) => (
                                <tr key={day.sale_date}>
                                    <td>{day.sale_date}</td>
                                    <td>{day.order_count}</td>
                                    <td>{formatCurrency(day.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

        </div>
    );
}

export default AdminReports;