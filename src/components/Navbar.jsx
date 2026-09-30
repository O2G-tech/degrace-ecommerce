import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      API.get("/notifications/get.php")
        .then((res) => {
          if (res.data?.success) {
            setNotifications(res.data.data || []);
          }
        })
        .catch(() => {});
    } else {
      setNotifications([]);
    }
  }, [user]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header site-header--transparent">
      {/* Top Editorial Sub-bar */}
      <div className="editorial-ticker">
        <div className="ticker-content">
          <span>PARIS • MILAN • LONDON • LAGOS</span>
          <span className="ticker-bullet">✦</span>
          <span>DE-GRACE CLASSIC BOUTIQUE: HAUTE COUTURE &amp; BESPOKE READY-TO-WEAR</span>
          <span className="ticker-bullet">✦</span>
          <span>FREE EXPRESS DISPATCH &amp; CONCIERGE PACKAGING</span>
          <span className="ticker-bullet">✦</span>
          <span>UP TO 40% OFF SELECTED COLLECTIONS</span>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-container">
          
          {/* Mobile menu trigger */}
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>

          {/* Left Navigation Links */}
          <div className="nav-primary-links">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/products" className={`nav-item ${isActive('/products') ? 'active' : ''}`}>Shop</Link>
            <Link to="/products?category_id=1" className="nav-item">
              New <span className="nav-badge-dot"></span>
            </Link>
            <Link to="/products?sort=price_high" className="nav-item">Couture</Link>
            <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
          </div>

          {/* Center Brand Logo */}
          <div className="logo-wrapper">
            <Link to="/" className="brand-logo">
              <span className="logo-crest">EST. 2026 • PARIS</span>
              <span className="logo-main">DE-GRACE</span>
              <span className="logo-sub">CLASSIC BOUTIQUE</span>
            </Link>
          </div>

          {/* Right Action Icons & Search */}
          <div className="nav-actions">
            <form className="search-container" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search collection"
              />
              <button type="submit" className="search-button" aria-label="Submit search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>

            <div className="nav-user-links" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {user && (
                <div className="notification-bell-wrapper" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="nav-action-btn notif-bell-btn"
                    title="Concierge Notifications & Updates"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', padding: '6px' }}
                  >
                    <svg className="nav-svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {notifications.length > 0 && (
                      <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', background: '#c5a059' }}></span>
                    )}
                  </button>

                  {/* Notification Dropdown Popover */}
                  {notifOpen && (
                    <div className="notif-dropdown-card" style={{ position: 'absolute', right: 0, top: '40px', width: '320px', background: '#181818', color: '#f5f3ef', borderRadius: '8px', padding: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.5)', border: '1px solid rgba(197,160,89,0.3)', zIndex: 1000 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#c5a059', textTransform: 'uppercase' }}>Atelier Concierge Inbox</span>
                        <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                      </div>

                      <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', margin: '20px 0' }}>No new messages or order updates.</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} onClick={() => { setNotifOpen(false); navigate(n.link); }} style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px', cursor: 'pointer', borderLeft: n.type === 'message' ? '3px solid #c5a059' : '3px solid #4caf50' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>{n.title}</div>
                              <div style={{ fontSize: '0.74rem', color: '#bbb', lineHeight: 1.4 }}>{n.message}</div>
                              <div style={{ fontSize: '0.65rem', color: '#c5a059', marginTop: '4px' }}>{n.date ? new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '10px', textAlign: 'center' }}>
                        <Link to="/orders" onClick={() => setNotifOpen(false)} style={{ fontSize: '0.75rem', color: '#c5a059', textDecoration: 'none', fontWeight: 700 }}>View All Orders &amp; Tracking →</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user ? (
                <div className="user-dropdown-container">
                  <Link to="/account" className="nav-action-btn" title="Client Profile">
                    <svg className="nav-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="nav-action-label">{user.name?.split(" ")[0]}</span>
                  </Link>
                  <button onClick={logout} className="nav-logout-btn" title="Sign Out">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-action-btn" title="Sign In">
                  <svg className="nav-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="nav-action-label">Sign In</span>
                </Link>
              )}

              <Link to="/cart" className="nav-action-btn cart-btn" title="Shopping Bag">
                <svg className="nav-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className="nav-action-label">Bag</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Slide Drawer Menu */}
        {menuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
            <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                <span className="mobile-brand-title">DE-GRACE</span>
                <button className="mobile-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
              </div>

              <form className="mobile-search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>

              <div className="mobile-nav-links">
                <Link to="/" onClick={() => setMenuOpen(false)}>Home Editorial</Link>
                <Link to="/products" onClick={() => setMenuOpen(false)}>All Collections</Link>
                <Link to="/products?category_id=1" onClick={() => setMenuOpen(false)}>New Arrivals</Link>
                <Link to="/products?sort=price_high" onClick={() => setMenuOpen(false)}>Haute Couture</Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>Shopping Bag</Link>
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setMenuOpen(false)}>Client Profile ({user.name})</Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="mobile-logout-btn">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>Register Client Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;