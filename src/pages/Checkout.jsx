import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCart } from "../services/cartService";
import { createOrder } from "../services/orderService";
import { initializePayment } from "../services/paymentService";
import { getImageUrl } from "../services/api";
import "./styling/Checkout.css";

function Checkout() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        state: "FCT",
        city: "Abuja",
        postal_code: ""
    });

    const [deliveryMethod, setDeliveryMethod] = useState("standard");
    const [paymentMethod, setPaymentMethod] = useState("pay_on_delivery");
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const deliveryPrices = {
        standard: 5000,
        express: 10000
    };

    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getCart();

                if (!result || !result.success) {
                    setError(result?.message || "Failed to load shopping bag.");
                    return;
                }

                if (!result.data || !result.data.items || result.data.items.length === 0) {
                    setError("Your boutique shopping bag is empty.");
                    return;
                }

                setCart(result.data);
            } catch (err) {
                console.error("CHECKOUT CART ERROR:", err);
                if (err.response?.status === 401) {
                    navigate("/login?redirect=/checkout");
                    return;
                }
                setError("Unable to connect to boutique server for checkout.");
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateSubtotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((acc, item) => {
            const price = Number(item.price || 0);
            const qty = Number(item.quantity || 1);
            return acc + (price * qty);
        }, 0);
    };

    const getDeliveryFee = () => {
        return deliveryPrices[deliveryMethod] || 5000;
    };

    const getTotal = () => {
        return calculateSubtotal() + getDeliveryFee();
    };

    const formatPrice = (val) => {
        return `₦${Number(val || 0).toLocaleString()}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.full_name || !formData.phone || !formData.email || !formData.address || !formData.state || !formData.city) {
            alert("Please complete all required delivery details.");
            return;
        }

        try {
            setSubmitting(true);

            const orderData = {
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                state: formData.state,
                city: formData.city,
                postal_code: formData.postal_code,
                delivery_method: deliveryMethod,
                payment_method: paymentMethod
            };

            const result = await createOrder(orderData);

            if (!result || !result.success) {
                alert(result?.message || "Failed to place atelier order.");
                return;
            }

            localStorage.setItem("lastOrder", JSON.stringify(result.data));

            if (paymentMethod === "online_payment") {
                const payment = await initializePayment(result.data.order_id, formData.email);
                if (!payment.success) {
                    alert(payment.message || "Failed to initialize online payment.");
                    return;
                }
                window.location.assign(payment.data.authorization_url);
            } else {
                navigate(`/orders/${result.data.order_id}`);
            }
        } catch (err) {
            console.error("ORDER CREATION ERROR:", err);
            alert(err.response?.data?.message || "Something went wrong while placing your order.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="checkout-page">
                    <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem" }}>
                            Preparing Maison Concierge Checkout...
                        </p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className="checkout-page">
                    <div className="checkout-section-card" style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center" }}>
                        <p style={{ color: "#b33939", marginBottom: "1.5rem", fontSize: "1.1rem" }}>{error}</p>
                        <Link to="/products" className="checkout-submit-btn" style={{ textDecoration: "none", display: "inline-block" }}>
                            Explore Couture Collections
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="checkout-page">
                <header className="checkout-header-editorial">
                    <span className="checkout-eyebrow">HAUTE COUTURE CONCIERGE</span>
                    <h1 className="checkout-title">Boutique Checkout</h1>
                </header>

                <form onSubmit={handleSubmit} className="checkout-grid">
                    {/* Left Steps */}
                    <div className="checkout-form-container">
                        {/* Step 1: Delivery Address */}
                        <section className="checkout-section-card">
                            <h2 className="checkout-section-title">
                                <span className="section-badge-step">1</span>
                                Delivery Dossier &amp; Destination
                            </h2>

                            <div className="form-row-duo">
                                <div className="form-group-editorial">
                                    <label htmlFor="full_name">Client Full Name *</label>
                                    <input
                                        id="full_name"
                                        type="text"
                                        name="full_name"
                                        placeholder="e.g. David Alabi"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group-editorial">
                                    <label htmlFor="phone">Direct Telephone *</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="e.g. 08012345678"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-editorial">
                                <label htmlFor="email">Email for Order Dispatch *</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="client@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group-editorial">
                                <label htmlFor="address">Full Delivery Street Address *</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    placeholder="Street, Estate name, Building number, Suite / Penthouse"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row-trio">
                                <div className="form-group-editorial">
                                    <label htmlFor="state">State *</label>
                                    <input
                                        id="state"
                                        type="text"
                                        name="state"
                                        placeholder="e.g. Lagos / FCT"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group-editorial">
                                    <label htmlFor="city">City / District *</label>
                                    <input
                                        id="city"
                                        type="text"
                                        name="city"
                                        placeholder="e.g. Maitama / Victoria Island"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group-editorial">
                                    <label htmlFor="postal_code">Postal Code</label>
                                    <input
                                        id="postal_code"
                                        type="text"
                                        name="postal_code"
                                        placeholder="Optional"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Step 2: Delivery Method */}
                        <section className="checkout-section-card">
                            <h2 className="checkout-section-title">
                                <span className="section-badge-step">2</span>
                                Select Delivery Speed &amp; Courier
                            </h2>

                            <div className="options-card-group">
                                <div
                                    className={`option-selector-card ${deliveryMethod === "standard" ? "active" : ""}`}
                                    onClick={() => setDeliveryMethod("standard")}
                                >
                                    <div className="option-radio-indicator" />
                                    <div className="option-text-block">
                                        <span className="option-title">Standard White-Glove</span>
                                        <span className="option-desc">Estimated 2–4 business days delivery.</span>
                                        <span className="option-price-tag">₦5,000</span>
                                    </div>
                                </div>

                                <div
                                    className={`option-selector-card ${deliveryMethod === "express" ? "active" : ""}`}
                                    onClick={() => setDeliveryMethod("express")}
                                >
                                    <div className="option-radio-indicator" />
                                    <div className="option-text-block">
                                        <span className="option-title">Express Priority Courier</span>
                                        <span className="option-desc">Next-day direct VIP dispatch.</span>
                                        <span className="option-price-tag">₦10,000</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Step 3: Payment Method */}
                        <section className="checkout-section-card">
                            <h2 className="checkout-section-title">
                                <span className="section-badge-step">3</span>
                                Payment Preference
                            </h2>

                            <div className="options-card-group">
                                <div
                                    className={`option-selector-card ${paymentMethod === "pay_on_delivery" ? "active" : ""}`}
                                    onClick={() => setPaymentMethod("pay_on_delivery")}
                                >
                                    <div className="option-radio-indicator" />
                                    <div className="option-text-block">
                                        <span className="option-title">Pay on Delivery</span>
                                        <span className="option-desc">Settle via POS / Transfer upon concierge arrival.</span>
                                    </div>
                                </div>

                                <div
                                    className={`option-selector-card ${paymentMethod === "online_payment" ? "active" : ""}`}
                                    onClick={() => setPaymentMethod("online_payment")}
                                >
                                    <div className="option-radio-indicator" />
                                    <div className="option-text-block">
                                        <span className="option-title">Instant Online Payment</span>
                                        <span className="option-desc">Secure debit / credit card or instant bank transfer.</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Summary Sidebar */}
                    <aside className="checkout-summary-card">
                        <h2 className="summary-heading">Order Review</h2>

                        {/* Items Preview */}
                        <div className="checkout-items-preview">
                            {cart?.items?.map((item) => (
                                <div className="preview-item-row" key={item.id || item.product_id}>
                                    {item.image ? (
                                        <img
                                            src={getImageUrl("products", item.image)}
                                            alt={item.name}
                                            className="preview-item-img"
                                        />
                                    ) : (
                                        <div className="preview-item-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-primary)", fontSize: "0.8rem", fontWeight: 700 }}>
                                            DG
                                        </div>
                                    )}
                                    <div className="preview-item-details">
                                        <div className="preview-item-name">{item.name}</div>
                                        <div className="preview-item-qty">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                                    </div>
                                    <div className="preview-item-price">
                                        {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>{formatPrice(calculateSubtotal())}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Courier Dispatch</span>
                            <strong>{formatPrice(getDeliveryFee())}</strong>
                        </div>

                        <div className="summary-row total-row">
                            <span>Total Due</span>
                            <span className="total-amount">{formatPrice(getTotal())}</span>
                        </div>

                        <button
                            type="submit"
                            className="checkout-submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? "PLACING ATELIER ORDER..." : `CONFIRM & PLACE ORDER (${formatPrice(getTotal())})`}
                        </button>

                        <div className="security-seal-row">
                            <span className="security-seal-icon">🔒</span>
                            <span>256-Bit Encrypted Secure Checkout</span>
                        </div>
                    </aside>
                </form>
            </main>

            <Footer />
        </>
    );
}

export default Checkout;
