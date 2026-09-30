import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrder } from "../services/orderService";
import { getImageUrl } from "../services/api";
import "./styling/OrderDetails.css";

function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getOrder(id);

                if (!result || !result.success) {
                    setError(result?.message || "Failed to load order dossier.");
                    return;
                }

                setOrder(result.data.order);
                setItems(result.data.items || []);
            } catch (err) {
                console.error("ORDER DETAILS LOAD ERROR:", err);
                setError(err.response?.data?.message || "Failed to load consignment details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadOrder();
        }
    }, [id]);

    const formatPrice = (value) => {
        return `₦${Number(value || 0).toLocaleString()}`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="order-details-page">
                    <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem" }}>
                            Retrieving Maison Consignment Dossier...
                        </p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Navbar />
                <main className="order-details-page">
                    <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", background: "#fff", padding: "3rem", borderRadius: "8px", border: "1px solid rgba(15,15,17,0.08)" }}>
                        <p style={{ color: "#b33939", marginBottom: "1.5rem", fontSize: "1.1rem" }}>{error || "Order not found"}</p>
                        <Link to="/orders" className="btn-view-dossier" style={{ display: "inline-block" }}>
                            Return to My Orders Archive
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const getStatusClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s.includes("delivered") || s.includes("completed")) return "delivered";
        if (s.includes("shipped")) return "shipped";
        if (s.includes("processing")) return "processing";
        return "pending";
    };

    const isStepActive = (stepNum) => {
        const s = order.status || "Pending";
        if (stepNum === 1) return true;
        if (stepNum === 2) return ["Processing", "Shipped", "Delivered", "Completed"].includes(s);
        if (stepNum === 3) return ["Shipped", "Delivered", "Completed"].includes(s);
        if (stepNum === 4) return ["Delivered", "Completed"].includes(s);
        return false;
    };

    return (
        <>
            <Navbar />

            <main className="order-details-page">
                <Link to="/orders" className="order-back-nav">
                    ← Back to Order Archives
                </Link>

                <header className="order-header-editorial">
                    <div>
                        <span className="order-eyebrow">CONSIGNMENT DOSSIER</span>
                        <h1 className="order-title">Order #{order.order_number}</h1>
                        <p className="order-date-stamp">
                            Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recent"}
                        </p>
                    </div>

                    <span className={`status-badge-pill ${getStatusClass(order.status)}`}>
                        ● {order.status || "Pending"}
                    </span>
                </header>

                {/* Live Consignment Tracker */}
                <section className="tracker-dossier-card">
                    <div className="tracker-top-bar">
                        <div>
                            <span className="tracker-subheading">LIVE CONSIGNMENT STATUS</span>
                            <h2 className="tracker-order-num">Tracking Reference: #{order.order_number}</h2>
                        </div>
                        <span className={`status-badge-pill ${getStatusClass(order.status)}`}>
                            {order.status || "Pending"}
                        </span>
                    </div>

                    <div className="timeline-grid">
                        <div className={`timeline-node ${isStepActive(1) ? "active" : ""}`}>
                            <div className="timeline-node-circle">{isStepActive(1) ? "✓" : "1"}</div>
                            <div className="timeline-node-title">Order Confirmed</div>
                            <div className="timeline-node-desc">Logged in Maison records</div>
                        </div>

                        <div className={`timeline-node ${isStepActive(2) ? "active" : ""}`}>
                            <div className="timeline-node-circle">{isStepActive(2) ? "✓" : "2"}</div>
                            <div className="timeline-node-title">Atelier Processing</div>
                            <div className="timeline-node-desc">Quality inspection &amp; prep</div>
                        </div>

                        <div className={`timeline-node ${isStepActive(3) ? "active" : ""}`}>
                            <div className="timeline-node-circle">{isStepActive(3) ? "✓" : "3"}</div>
                            <div className="timeline-node-title">Dispatched / Courier</div>
                            <div className="timeline-node-desc">White-glove priority transit</div>
                        </div>

                        <div className={`timeline-node ${isStepActive(4) ? "active" : ""}`}>
                            <div className="timeline-node-circle">{isStepActive(4) ? "✓" : "4"}</div>
                            <div className="timeline-node-title">Delivered &amp; Complete</div>
                            <div className="timeline-node-desc">Safely received by client</div>
                        </div>
                    </div>
                </section>

                {/* Concierge Message from Atelier Admin */}
                {order.admin_note && (
                    <section className="concierge-chat-card">
                        <div className="concierge-chat-header">
                            💬 Direct Message from DE-GRACE Chief Curator
                        </div>
                        <p className="concierge-chat-body">
                            "{order.admin_note}"
                        </p>
                    </section>
                )}

                {/* Dossier Grid */}
                <div className="order-dossier-grid">
                    {/* Left: Purchased Products */}
                    <div className="order-card-panel">
                        <h2 className="panel-header-title">
                            <span>Acquired Couture Pieces</span>
                            <span className="panel-item-count">{items.length} {items.length === 1 ? "Piece" : "Pieces"}</span>
                        </h2>

                        <div className="order-items-table">
                            {items.map((item) => {
                                const imageUrl = item.image ? getImageUrl("products", item.image) : "";
                                const lineTotal = item.subtotal !== undefined ? Number(item.subtotal) : Number(item.price || 0) * Number(item.quantity || 1);

                                return (
                                    <div className="order-line-item" key={item.id}>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={item.product_name}
                                                className="order-line-thumb"
                                            />
                                        ) : (
                                            <div className="order-no-thumb">DG</div>
                                        )}

                                        <div className="order-line-info">
                                            <h3 className="order-line-title">{item.product_name}</h3>
                                            <div className="order-line-meta">
                                                Qty: {item.quantity} × {formatPrice(item.price)}
                                            </div>
                                        </div>

                                        <div className="order-line-subtotal">
                                            {formatPrice(lineTotal)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Delivery Information & Financial Breakdown */}
                    <aside>
                        <div className="order-card-panel">
                            <h2 className="panel-header-title">
                                <span>Delivery Destination</span>
                            </h2>

                            <div className="dossier-info-list">
                                <div className="dossier-info-row">
                                    <span className="dossier-info-label">Client Name</span>
                                    <span className="dossier-info-val">{order.full_name}</span>
                                </div>

                                <div className="dossier-info-row">
                                    <span className="dossier-info-label">Telephone</span>
                                    <span className="dossier-info-val">{order.phone}</span>
                                </div>

                                <div className="dossier-info-row">
                                    <span className="dossier-info-label">Email</span>
                                    <span className="dossier-info-val">{order.email}</span>
                                </div>

                                <div className="dossier-info-row">
                                    <span className="dossier-info-label">Street Address</span>
                                    <span className="dossier-info-val">{order.address}</span>
                                </div>

                                <div className="dossier-info-row">
                                    <span className="dossier-info-label">City / State</span>
                                    <span className="dossier-info-val">{order.city}, {order.state}</span>
                                </div>

                                <div className="dossier-info-row">
                                    <span className="dossier-info-label">Delivery Service</span>
                                    <span className="dossier-info-val" style={{ textTransform: "capitalize" }}>
                                        {order.delivery_method || "Standard"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="order-card-panel">
                            <h2 className="panel-header-title">
                                <span>Financial Summary</span>
                            </h2>

                            <div className="financial-summary-box">
                                <div className="financial-row">
                                    <span>Subtotal</span>
                                    <strong>{formatPrice(order.subtotal)}</strong>
                                </div>

                                <div className="financial-row">
                                    <span>White-Glove Dispatch</span>
                                    <strong>{formatPrice(order.delivery_fee)}</strong>
                                </div>

                                <div className="financial-row grand-total">
                                    <span>Total Settled</span>
                                    <span className="grand-total-amount">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default OrderDetails;
