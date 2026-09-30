import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    getCart,
    updateCartItem,
    removeFromCart
} from "../services/cartService";
import { getImageUrl } from "../services/api";
import "./styling/Cart.css";

function Cart() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [delivery, setDelivery] = useState(5000);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getCart();

            if (!result || !result.success) {
                setError(result?.message || "Failed to load boutique shopping bag.");
                return;
            }

            const cartItems = result.data?.items || [];
            setItems(cartItems);

            let calculatedSubtotal = 0;
            cartItems.forEach((item) => {
                const price = Number(item.price || 0);
                const quantity = Number(item.quantity || 0);
                calculatedSubtotal += price * quantity;
            });

            const backendSubtotal = Number(result.data?.subtotal);
            const finalSubtotal = !isNaN(backendSubtotal) && backendSubtotal > 0
                ? backendSubtotal
                : calculatedSubtotal;
            setSubtotal(finalSubtotal);

            const deliveryFee = Number(result.data?.delivery ?? result.data?.delivery_fee ?? 5000);
            const finalDelivery = cartItems.length > 0 ? (isNaN(deliveryFee) ? 5000 : deliveryFee) : 0;
            setDelivery(finalDelivery);

            const backendTotal = Number(result.data?.total);
            const finalTotal = !isNaN(backendTotal) && backendTotal > 0
                ? backendTotal
                : finalSubtotal + finalDelivery;
            setTotal(finalTotal);

        } catch (error) {
            console.error("CART LOAD ERROR:", error);
            if (error.response?.status === 401) {
                setError("Please sign in to your client account to view your shopping bag.");
            } else {
                setError(error.response?.data?.message || "Unable to connect to boutique server.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const getCartItemId = (item) => {
        return item.cart_item_id ?? item.id ?? null;
    };

    const increaseQuantity = async (item) => {
        const cartItemId = getCartItemId(item);
        if (!cartItemId) return;

        try {
            setUpdatingId(cartItemId);
            const result = await updateCartItem(cartItemId, Number(item.quantity) + 1);
            if (!result.success) {
                alert(result.message || "Failed to update quantity");
                return;
            }
            await loadCart();
        } catch (error) {
            console.error("INCREASE QUANTITY ERROR:", error);
            alert(error.response?.data?.message || "Failed to update piece quantity.");
        } finally {
            setUpdatingId(null);
        }
    };

    const decreaseQuantity = async (item) => {
        const quantity = Number(item.quantity);
        if (quantity <= 1) return;

        const cartItemId = getCartItemId(item);
        if (!cartItemId) return;

        try {
            setUpdatingId(cartItemId);
            const result = await updateCartItem(cartItemId, quantity - 1);
            if (!result.success) {
                alert(result.message || "Failed to update quantity");
                return;
            }
            await loadCart();
        } catch (error) {
            console.error("DECREASE QUANTITY ERROR:", error);
            alert(error.response?.data?.message || "Failed to update piece quantity.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemoveItem = async (item) => {
        const cartItemId = getCartItemId(item);
        if (!cartItemId) return;

        const confirmed = window.confirm(`Remove "${item.name || 'this piece'}" from your shopping bag?`);
        if (!confirmed) return;

        try {
            setUpdatingId(cartItemId);
            const result = await removeFromCart(cartItemId);
            if (result.success) {
                setItems((current) => current.filter((ci) => getCartItemId(ci) !== cartItemId));
                await loadCart();
            } else {
                alert(result.message || "Failed to remove piece.");
            }
        } catch (error) {
            console.error("REMOVE CART ERROR:", error);
            alert(error.response?.data?.message || "Failed to remove piece from shopping bag.");
        } finally {
            setUpdatingId(null);
        }
    };

    const formatPrice = (val) => {
        return `₦${Number(val || 0).toLocaleString()}`;
    };

    return (
        <>
            <Navbar />

            <main className="cart-page">
                <header className="cart-header-editorial">
                    <span className="cart-eyebrow">YOUR ATELIER SELECTION</span>
                    <h1 className="cart-title">Boutique Shopping Bag</h1>
                </header>

                {/* Loading State */}
                {loading && (
                    <div className="cart-loading-state">
                        <p>Opening Maison Shopping Bag...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="cart-error-state">
                        <p style={{ color: "#b33939", marginBottom: "1.5rem" }}>{error}</p>
                        {error.toLowerCase().includes("sign in") || error.toLowerCase().includes("login") ? (
                            <button
                                type="button"
                                className="btn-editorial-gold"
                                onClick={() => navigate("/login?redirect=/cart")}
                            >
                                Sign In to Client Account
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn-editorial-gold"
                                onClick={loadCart}
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && items.length === 0 && (
                    <div className="empty-cart-editorial">
                        <div className="empty-cart-icon">✧</div>
                        <h2>Your Shopping Bag is Empty</h2>
                        <p>Discover our newest curated haute couture, bespoke jewelry, and luxury accessories.</p>
                        <Link to="/products" className="btn-editorial-gold">
                            EXPLORE COUTURE ARCHIVE
                        </Link>
                    </div>
                )}

                {/* Cart Active */}
                {!loading && !error && items.length > 0 && (
                    <div className="cart-layout-grid">
                        {/* Cart Items List */}
                        <section className="cart-items-column">
                            {items.map((item) => {
                                const cartItemId = getCartItemId(item);
                                const price = Number(item.price || 0);
                                const quantity = Number(item.quantity || 0);
                                const itemTotal = item.item_total !== undefined ? Number(item.item_total) : price * quantity;
                                const isBusy = updatingId === cartItemId;
                                const imageUrl = item.image ? getImageUrl("products", item.image) : "";

                                return (
                                    <article className="cart-item-card" key={cartItemId || item.product_id}>
                                        <div className="cart-thumbnail-wrapper">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    className="cart-thumbnail-img"
                                                />
                                            ) : (
                                                <div className="cart-no-img-monogram">
                                                    <span>DG</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="cart-item-info">
                                            <span className="cart-item-category">DE-GRACE EXCLUSIVE</span>
                                            <h2 className="cart-item-title">{item.name}</h2>
                                            <div className="cart-item-unit-price">
                                                Unit: {formatPrice(price)}
                                            </div>

                                            <div className="cart-item-actions">
                                                <div className="editorial-qty-control">
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={() => decreaseQuantity(item)}
                                                        disabled={quantity <= 1 || isBusy}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="qty-display">{quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={() => increaseQuantity(item)}
                                                        disabled={isBusy}
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="cart-remove-link"
                                                    onClick={() => handleRemoveItem(item)}
                                                    disabled={isBusy}
                                                >
                                                    Remove Piece
                                                </button>
                                            </div>
                                        </div>

                                        <div className="cart-item-total-col">
                                            <span className="cart-item-total-label">Subtotal</span>
                                            <span className="cart-item-total-val">{formatPrice(itemTotal)}</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        {/* Order Summary Sidebar */}
                        <aside className="cart-summary-card">
                            <h2 className="summary-heading">Order Summary</h2>

                            <div className="summary-row">
                                <span>Atelier Subtotal</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            <div className="summary-row">
                                <span>White-Glove Dispatch</span>
                                <strong>{delivery > 0 ? formatPrice(delivery) : "COMPLIMENTARY"}</strong>
                            </div>

                            <div className="summary-row total-row">
                                <span>Total Investment</span>
                                <span className="total-amount">{formatPrice(total)}</span>
                            </div>

                            <button
                                type="button"
                                className="btn-proceed-checkout"
                                onClick={() => navigate("/checkout")}
                            >
                                PROCEED TO CHECKOUT →
                            </button>

                            <Link to="/products" className="continue-shopping-link">
                                ← Continue Perusing Collections
                            </Link>

                            <div className="luxury-perks-list">
                                <div className="perk-item">
                                    <span className="perk-icon">✦</span>
                                    <span>Complimentary Concierge Packaging</span>
                                </div>
                                <div className="perk-item">
                                    <span className="perk-icon">✦</span>
                                    <span>Certificate of Atelier Authenticity</span>
                                </div>
                                <div className="perk-item">
                                    <span className="perk-icon">✦</span>
                                    <span>Discreet Insured Express Delivery</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}

export default Cart;
