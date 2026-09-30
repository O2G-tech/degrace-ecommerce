import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrders } from "../services/orderService";
import "./styling/Orders.css";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getOrders();

                if (!result.success) {
                    setError(result.message || "Failed to load order history.");
                    return;
                }

                setOrders(result.data || []);
            } catch (err) {
                console.error("ORDERS LOAD ERROR:", err);
                if (err.response?.status === 401) {
                    navigate("/login?redirect=/orders");
                    return;
                }
                setError("Unable to retrieve order history from boutique archives.");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [navigate]);

    const formatPrice = (value) => {
        return `₦${Number(value || 0).toLocaleString()}`;
    };

    const getStatusClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s.includes("delivered") || s.includes("completed")) return "delivered";
        if (s.includes("shipped")) return "shipped";
        if (s.includes("processing")) return "processing";
        return "pending";
    };

    return (
        <>
            <Navbar />

            <main className="orders-page">
                <header className="orders-header-editorial">
                    <span className="orders-eyebrow">CLIENT ARCHIVES</span>
                    <h1 className="orders-title">My Orders History</h1>
                </header>

                {loading && (
                    <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem" }}>
                            Accessing Maison Order Archives...
                        </p>
                    </div>
                )}

                {error && !loading && (
                    <div style={{ maxWidth: "600px", margin: "3rem auto", textAlign: "center", background: "#fff", padding: "2.5rem", borderRadius: "8px", border: "1px solid rgba(15,15,17,0.08)" }}>
                        <p style={{ color: "#b33939", marginBottom: "1.5rem" }}>{error}</p>
                        <Link to="/products" className="btn-view-dossier" style={{ display: "inline-block" }}>
                            Browse Collections
                        </Link>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div style={{ maxWidth: "650px", margin: "3rem auto", textAlign: "center", background: "#fff", padding: "4rem 2rem", borderRadius: "8px", border: "1px solid rgba(15,15,17,0.08)" }}>
                        <div style={{ fontSize: "2.5rem", color: "var(--gold-primary)", marginBottom: "1rem" }}>✦</div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", marginBottom: "0.5rem" }}>No Consignments Placed Yet</h2>
                        <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>You haven't acquired any boutique pieces yet.</p>
                        <Link to="/products" className="btn-view-dossier" style={{ display: "inline-block", background: "var(--gold-gradient)", color: "#0b0b0d", border: "none", padding: "0.85rem 2rem" }}>
                            Explore Ready-to-Wear
                        </Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="orders-list-container">
                        {orders.map((order) => (
                            <article className="order-history-card" key={order.id}>
                                <div className="order-history-main">
                                    <span style={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold-primary)", fontWeight: 700 }}>
                                        ORDER #{order.order_number}
                                    </span>
                                    <h2 className="order-history-number">
                                        Consignment for {order.full_name}
                                    </h2>
                                    <span className="order-history-meta">
                                        Placed {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""} • {order.items_count || 1} {(order.items_count || 1) === 1 ? "Piece" : "Pieces"}
                                    </span>
                                </div>

                                <div className="order-history-status-wrap">
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-muted)" }}>Total Paid</div>
                                        <div className="order-history-total">{formatPrice(order.total)}</div>
                                    </div>

                                    <Link to={`/orders/${order.id}`} className="btn-view-dossier">
                                        Track Dossier →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}

export default Orders;
