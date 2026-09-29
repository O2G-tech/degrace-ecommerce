import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Account() {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="magazine-layout">
                <Navbar />
                <div className="page-container text-center" style={{ padding: "100px 20px" }}>
                    <div className="boutique-spinner"></div>
                    <p style={{ marginTop: "20px", color: "var(--muted)", fontStyle: "italic" }}>
                        Retrieving client profile...
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="magazine-layout">
                <Navbar />
                <div className="page-container text-center" style={{ padding: "120px 20px" }}>
                    <span style={{ fontSize: "3rem" }}>🗝️</span>
                    <h2 style={{ fontFamily: "Playfair Display, serif", margin: "20px 0 10px", fontSize: "2.4rem" }}>
                        Privé Client Portal
                    </h2>
                    <p style={{ color: "var(--muted)", maxWidth: "460px", margin: "0 auto 30px" }}>
                        Access to client order history, bespoke fitting schedules, and private vault pieces requires authentication.
                    </p>
                    <button
                        className="btn-magazine-primary"
                        onClick={() => navigate("/login")}
                    >
                        <span>SIGN IN TO CLIENT ACCOUNT</span>
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="magazine-layout">
            <Navbar />

            <main className="page-container client-portal-page" style={{ margin: "50px auto" }}>
                <div className="client-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "25px", marginBottom: "35px" }}>
                    <span className="section-issue-number">DE-GRACE PRIVÉ MEMBER</span>
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", margin: "10px 0" }}>
                        Client Dossier
                    </h1>
                    <p style={{ color: "var(--muted)" }}>
                        Welcome back to the DE-GRACE Maison, {user.name}.
                    </p>
                </div>

                <div className="client-portal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
                    {/* Profile Card */}
                    <div className="client-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "35px", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px" }}>
                            <div style={{ width: "65px", height: "65px", borderRadius: "50%", background: "linear-gradient(135deg, #0b0b0c, #2a2a2f)", color: "#c5a059", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700, border: "2px solid #c5a059" }}>
                                {user.name ? user.name.slice(0, 2).toUpperCase() : "DG"}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontFamily: "Playfair Display, serif", fontSize: "1.4rem" }}>{user.name}</h3>
                                <span style={{ fontSize: "0.85rem", color: "var(--boutique-gold)", fontWeight: 600, letterSpacing: "0.08em" }}>
                                    TIER: ROYAL PRIVILEGE
                                </span>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                            <p style={{ margin: "12px 0", color: "var(--muted)", fontSize: "0.95rem" }}>
                                <strong style={{ color: "var(--text)" }}>Email:</strong> {user.email}
                            </p>
                            <p style={{ margin: "12px 0", color: "var(--muted)", fontSize: "0.95rem" }}>
                                <strong style={{ color: "var(--text)" }}>Telephone:</strong> {user.phone || "Private / Upon request"}
                            </p>
                            <p style={{ margin: "12px 0", color: "var(--muted)", fontSize: "0.95rem" }}>
                                <strong style={{ color: "var(--text)" }}>Maison Status:</strong> Verified Authenticated Client
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
                            <button
                                onClick={handleLogout}
                                style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--border)", color: "#c93636", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.05em" }}
                            >
                                SIGN OUT
                            </button>
                        </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="client-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "35px", borderRadius: "8px", boxShadow: "var(--shadow)" }}>
                        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "20px" }}>
                            Boutique Services
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <Link to="/orders" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "6px", textDecoration: "none" }}>
                                <div>
                                    <strong style={{ display: "block" }}>My Couture Orders</strong>
                                    <small style={{ color: "var(--muted)" }}>Track dispatches, receipts, and order statuses</small>
                                </div>
                                <span style={{ color: "var(--boutique-gold)" }}>→</span>
                            </Link>

                            <Link to="/cart" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "6px", textDecoration: "none" }}>
                                <div>
                                    <strong style={{ display: "block" }}>Boutique Shopping Bag</strong>
                                    <small style={{ color: "var(--muted)" }}>View reserved pieces and proceed to checkout</small>
                                </div>
                                <span style={{ color: "var(--boutique-gold)" }}>→</span>
                            </Link>

                            <Link to="/products" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "6px", textDecoration: "none" }}>
                                <div>
                                    <strong style={{ display: "block" }}>Explore Haute Collections</strong>
                                    <small style={{ color: "var(--muted)" }}>Discover new seasonal runway arrivals</small>
                                </div>
                                <span style={{ color: "var(--boutique-gold)" }}>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Account;