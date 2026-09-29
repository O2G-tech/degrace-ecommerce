import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="magazine-footer">
      <div className="footer-newsletter-banner">
        <div className="footer-newsletter-content">
          <span className="newsletter-eyebrow">THE PRIVÉ DISPATCH</span>
          <h3 className="newsletter-title">Subscribe to the DE-GRACE Gazette</h3>
          <p className="newsletter-subtitle">
            Receive exclusive invitations to private salon viewings, early access to limited capsule releases, and seasonal lookbooks.
          </p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Welcome to the DE-GRACE Privé Club. Check your inbox for private access."); }}>
            <input 
              type="email" 
              placeholder="Enter your email address..." 
              required 
              aria-label="Email address for boutique newsletter"
            />
            <button type="submit">JOIN THE PRIVÉ</button>
          </form>
        </div>
      </div>

      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span className="footer-logo-main">DE-GRACE</span>
            <span className="footer-logo-sub">CLASSIC BOUTIQUE</span>
          </div>
          <p className="footer-bio">
            An emblem of unapologetic sophistication. DE-GRACE curates peerless couture, fine horology, and artisanal leatherworks for discerning connoisseurs of grace.
          </p>
          <div className="footer-locations">
            <span>PARIS</span> • <span>MILAN</span> • <span>LONDON</span> • <span>LAGOS</span>
          </div>
        </div>

        {/* Column 2: Collections */}
        <div className="footer-col">
          <h4 className="footer-heading">THE ATELIER</h4>
          <ul className="footer-links">
            <li><Link to="/products">Haute Couture Gowns</Link></li>
            <li><Link to="/products?sort=price_high">Bespoke Tailoring</Link></li>
            <li><Link to="/products">Artisan Italian Leather</Link></li>
            <li><Link to="/products">High Horology & Jewels</Link></li>
            <li><Link to="/products">Bridal & Red Carpet</Link></li>
          </ul>
        </div>

        {/* Column 3: Client Care */}
        <div className="footer-col">
          <h4 className="footer-heading">CLIENT CONCIERGE</h4>
          <ul className="footer-links">
            <li><Link to="/account">Client Profile</Link></li>
            <li><Link to="/orders">Order Tracking & Dispatch</Link></li>
            <li><Link to="/cart">Boutique Shopping Bag</Link></li>
            <li><a href="#fittings">Private Salon Fittings</a></li>
            <li><a href="#authenticity">Certificate of Authenticity</a></li>
            <li><a href="#shipping">White-Glove Delivery</a></li>
          </ul>
        </div>

        {/* Column 4: Maison Policies */}
        <div className="footer-col">
          <h4 className="footer-heading">THE MAISON</h4>
          <ul className="footer-links">
            <li><a href="#about">Heritage & Craftsmanship</a></li>
            <li><a href="#sustainability">Ethical Sourcing & Silks</a></li>
            <li><a href="#press">Editorial Press & Runway</a></li>
            <li><a href="#terms">Terms of Exclusivity</a></li>
            <li><Link to="/admin">Executive Desktop Suite</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2026 DE-GRACE CLASSIC BOUTIQUE. ALL RIGHTS RESERVED.</p>
          <div className="luxury-badges">
            <span>100% AUTHENTIC LUXURY</span>
            <span className="badge-dot">•</span>
            <span>ENCRYPTED SECURE PAYMENT</span>
            <span className="badge-dot">•</span>
            <span>EXPRESS CONCIERGE COURIER</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;