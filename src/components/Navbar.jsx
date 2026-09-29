import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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

            <div className="nav-user-links">
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