import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCards";
import { getCategories } from "../services/categoryService";
import { getProducts } from "../services/productService";
import { getImageUrl } from "../services/api";
import "../magazine-hero.css";

// Fallback high-fashion editorial categories in case database is empty or still initializing
const EDITORIAL_CATEGORIES = [
  { id: 1, name: "Haute Couture Gowns", slug: "couture", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80", count: "48 PIECES" },
  { id: 2, name: "Bespoke Suiting & Silks", slug: "suiting", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80", count: "32 PIECES" },
  { id: 3, name: "Artisan Leather Bags", slug: "leather", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", count: "65 PIECES" },
  { id: 4, name: "Fine Horology & Watches", slug: "horology", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80", count: "29 PIECES" },
  { id: 5, name: "Designer Footwear", slug: "shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80", count: "54 PIECES" },
  { id: 6, name: "Statement Jewelry", slug: "jewelry", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", count: "41 PIECES" },
];

// Fallback high-fashion products in case the database is not yet seeded
const FALLBACK_PRODUCTS = [
  { id: 1, name: "Sovereign Gold Embroidered Silk Velvet Gown", price: 345000, category_name: "Haute Couture Gowns", majority_rating: 5, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Venetian Midnight Double-Breasted Cashmere Blazer", price: 280000, category_name: "Bespoke Suiting & Silks", majority_rating: 5, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Florence Hand-Stitched Florentine Calfskin Tote", price: 195000, category_name: "Artisan Leather Bags", majority_rating: 5, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Celestial Chronometer 18K Rose Gold Edition", price: 650000, category_name: "High Horology & Watches", majority_rating: 5, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Starlight Diamond Cascade Chandelier Earrings", price: 420000, category_name: "Fine Statement Jewelry", majority_rating: 5, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Monogrammed Milanese Suede Dress Loafers", price: 175000, category_name: "Designer Footwear", majority_rating: 5, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Aura Pleated Metallic Lamé Evening Cape", price: 310000, category_name: "Haute Couture Gowns", majority_rating: 5, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80" },
  { id: 8, name: "Savile Row Silk Peak-Lapel Smoking Tuxedo", price: 490000, category_name: "Bespoke Suiting & Silks", majority_rating: 5, image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80" },
];

function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories from backend
        const catRes = await getCategories();
        if (catRes && catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
          setBackendStatus("connected");
        } else {
          setCategories(EDITORIAL_CATEGORIES);
        }

        // Fetch products from backend
        const prodRes = await getProducts({ limit: 8, sort: "latest" });
        if (prodRes && prodRes.success && prodRes.data && Array.isArray(prodRes.data.products) && prodRes.data.products.length > 0) {
          setFeaturedProducts(prodRes.data.products);
          setBackendStatus("connected");
        } else {
          setFeaturedProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn("Backend loading notice:", err);
        setCategories(EDITORIAL_CATEGORIES);
        setFeaturedProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="magazine-layout">
      <Navbar />

      {/* =========================================================================
          MAGAZINE EDITORIAL HERO — FULL SCREEN CRAZY MAGAZINE STYLE
      ========================================================================= */}
      <section className="mag-hero" id="hero">

        {/* TOP META SUB-BAR */}
        <div className="mag-hero__meta-bar">
          <div className="mag-hero__meta-left">
            <div className="mag-hero__dot-row">
              <span /><span /><span />
            </div>
            <span className="mag-hero__meta-label">ATELIER EDITORIAL • ISSUE 01</span>
          </div>
          <div className="mag-hero__meta-right">
            <span className="mag-hero__year">2026</span>
            <span className="mag-hero__tag">HAUTE COUTURE</span>
          </div>
        </div>

        {/* BODY GRID */}
        <div className="mag-hero__body">

          {/* ROPE ANIMATION HANGING SHOWCASE (Bags, Shoes, Shirt, Watch) */}
          <div className="rope-showcase-layer">
            
            {/* Item 1: Artisan Leather Bag (Top Left Rope) */}
            <div className="rope-item rope-item--bag">
              <div className="rope-string"></div>
              <div className="rope-knot"></div>
              <Link to="/products" className="rope-product-card" title="Artisan Leather Bag">
                <div className="rope-product-img-wrap">
                  <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80" alt="Artisan Leather Bag" />
                </div>
                <div className="rope-product-tag">
                  <span className="rope-tag-cat">BAG</span>
                  <span className="rope-tag-name">Leather Tote</span>
                  <span className="rope-tag-price">₦195,000</span>
                </div>
              </Link>
            </div>

            {/* Item 2: Designer Footwear (Top Right Rope) */}
            <div className="rope-item rope-item--shoes">
              <div className="rope-string"></div>
              <div className="rope-knot"></div>
              <Link to="/products" className="rope-product-card" title="Designer Footwear">
                <div className="rope-product-img-wrap">
                  <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80" alt="Designer Footwear" />
                </div>
                <div className="rope-product-tag">
                  <span className="rope-tag-cat">SHOES</span>
                  <span className="rope-tag-name">Dress Loafers</span>
                  <span className="rope-tag-price">₦175,000</span>
                </div>
              </Link>
            </div>

            {/* Item 3: Silk Shirt & Blazer (Mid-Left Rope) */}
            <div className="rope-item rope-item--shirt">
              <div className="rope-string"></div>
              <div className="rope-knot"></div>
              <Link to="/products" className="rope-product-card" title="Silk Shirt & Suiting">
                <div className="rope-product-img-wrap">
                  <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80" alt="Bespoke Silk Suiting" />
                </div>
                <div className="rope-product-tag">
                  <span className="rope-tag-cat">SHIRT / SUITING</span>
                  <span className="rope-tag-name">Silk Blazer</span>
                  <span className="rope-tag-price">₦280,000</span>
                </div>
              </Link>
            </div>

            {/* Item 4: High Horology Watch (Mid-Right Rope) */}
            <div className="rope-item rope-item--watch">
              <div className="rope-string"></div>
              <div className="rope-knot"></div>
              <Link to="/products" className="rope-product-card" title="18K Rose Gold Watch">
                <div className="rope-product-img-wrap">
                  <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80" alt="Rose Gold Watch" />
                </div>
                <div className="rope-product-tag">
                  <span className="rope-tag-cat">WATCH</span>
                  <span className="rope-tag-name">Rose Gold Chrono</span>
                  <span className="rope-tag-price">₦650,000</span>
                </div>
              </Link>
            </div>

          </div>

          {/* GIANT EDITORIAL HEADLINE */}
          <div className="mag-hero__content-row">
            <div className="mag-hero__headline-block">
              <span className="mag-hero__headline-top">DEFINE YOUR</span>
              <span className="mag-hero__headline-bottom">STYLE.</span>
            </div>
          </div>

          {/* MODEL IMAGE (centre, extra large towering model cutout) */}
          <div className="mag-hero__model-wrap">
            <img
              src="/brand_hero.png"
              alt="DE-GRACE Fashion Model"
              className="mag-hero__model-img"
            />
          </div>

          {/* LEFT STATS COLUMN */}
          <div className="mag-hero__left-col">
            <div className="mag-hero__stat-block">
              <span className="mag-hero__stat-num">410K</span>
              <span className="mag-hero__stat-label">Social Followers</span>
            </div>
            <div className="mag-hero__social-row">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">◯</a>
            </div>
          </div>

          {/* RIGHT INFO COLUMN */}
          <div className="mag-hero__right-col">
            <div className="mag-hero__page-num">
              <span>01</span> Page
            </div>

            {/* Avatar stack */}
            <div className="mag-hero__avatars">
              <img className="mag-hero__avatar" src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&auto=format" alt="client" />
              <img className="mag-hero__avatar" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format" alt="client" />
              <img className="mag-hero__avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format" alt="client" />
              <div className="mag-hero__avatar-count">+99</div>
            </div>

            {/* Promo card */}
            <div className="mag-hero__promo-card">
              <div className="mag-hero__promo-title">
                ENJOY UP TO <em>40% OFF</em> ON SELECTED ITEMS PLUS FREE SHIPPING!
              </div>
              <div className="mag-hero__promo-sub">Limited time offer • White-glove delivery</div>
            </div>

            {/* Premium Quality */}
            <div className="mag-hero__quality-badge">Premium Quality</div>

            {/* Brand partners */}
            <div className="mag-hero__partners-count">
              200+
              <span>Brand Partner</span>
            </div>
          </div>

          {/* SHOP NOW CTA */}
          <div className="mag-hero__cta-wrap">
            <Link to="/products" className="mag-hero__cta-btn">
              Shop Now
              <span className="mag-hero__cta-arrow">→</span>
            </Link>
          </div>

        </div>{/* end body */}

        {/* BOTTOM TICKER STRIPE */}
        <div className="mag-hero__ticker-stripe">
          <div className="mag-hero__ticker-inner">
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mag-hero__ticker-item">UP TO 40% DISCOUNT ON SELECTED ITEMS <span className="mag-hero__ticker-sep">✦</span></span>
                <span className="mag-hero__ticker-item"><em>FREE SHIPPING</em> <span className="mag-hero__ticker-sep">✦</span></span>
                <span className="mag-hero__ticker-item">BESPOKE COUTURE • TUSCAN LEATHERS • HIGH HOROLOGY <span className="mag-hero__ticker-sep">✦</span></span>
                <span className="mag-hero__ticker-item">UP TO 40% DISCOUNT ON SELECTED ITEMS <span className="mag-hero__ticker-sep">✦</span></span>
                <span className="mag-hero__ticker-item"><em>WHITE-GLOVE DISPATCH</em> <span className="mag-hero__ticker-sep">✦</span></span>
                <span className="mag-hero__ticker-item">PARIS • LONDON • LAGOS • MILAN <span className="mag-hero__ticker-sep">✦</span></span>
              </span>
            ))}
          </div>
        </div>

      </section>


        {/* =========================================================================
            SECTION 2: LUXURY EDITORIAL MARQUEE TICKER
        ========================================================================= */}
        <div className="luxury-marquee-wrap">
          <div className="luxury-marquee">
            <span>DE-GRACE CLASSIC BOUTIQUE</span>
            <span className="marquee-star">✦</span>
            <span>HAUTE COUTURE RUNWAY</span>
            <span className="marquee-star">✦</span>
            <span>BESPOKE CASHMERE & SILKS</span>
            <span className="marquee-star">✦</span>
            <span>TUSCAN ARTISAN LEATHERS</span>
            <span className="marquee-star">✦</span>
            <span>FINE HIGH HOROLOGY</span>
            <span className="marquee-star">✦</span>
            <span>PARIS • LONDON • LAGOS • MILAN</span>
            <span className="marquee-star">✦</span>
            <span>WHITE-GLOVE DISPATCH NATIONWIDE</span>
            <span className="marquee-star">✦</span>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: CURATED CATEGORIES SPREAD (MAGAZINE STYLE)
        ========================================================================= */}
        <section className="magazine-section categories-curation" data-aos="fade-up">
          <div className="section-header-editorial">
            <div className="header-meta">
              <span className="section-issue-number">CHAPTER 01</span>
              <span className="section-category-label">CURATED DEPARTMENTS</span>
            </div>
            <h2 className="section-editorial-title">
              DISCOVER BY <em>MAISON ATELIER</em>
            </h2>
            <p className="section-editorial-desc">
              Each department is selected with rare fabrics, hand-finished detailing, and visionary silhouette aesthetics.
            </p>
          </div>

          <div className="editorial-category-grid">
            {categories.map((cat, idx) => {
              const catImage = cat.image?.startsWith("http")
                ? cat.image
                : cat.image
                ? getImageUrl("categories", cat.image)
                : EDITORIAL_CATEGORIES[idx % EDITORIAL_CATEGORIES.length]?.image;

              return (
                <Link
                  key={cat.id || idx}
                  to={`/products?category_id=${cat.id}`}
                  className="editorial-cat-card"
                  data-aos="zoom-in"
                  data-aos-delay={idx * 70}
                >
                  <div className="cat-card-media">
                    <img src={catImage} alt={cat.name} loading="lazy" />
                    <div className="cat-card-vignette"></div>
                    <span className="cat-number">0{idx + 1}</span>
                  </div>
                  <div className="cat-card-content">
                    <span className="cat-department-tag">ATELIER ARCHIVE</span>
                    <h3 className="cat-name">{cat.name}</h3>
                    <span className="cat-explore-link">
                      EXPLORE DEPARTMENT <span className="cat-arrow">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: EDITORIAL SPREAD & STORY (THE MAISON HERITAGE)
        ========================================================================= */}
        <section className="magazine-section maison-spread" data-aos="fade-up">
          <div className="spread-container">
            <div className="spread-media" data-aos="fade-right">
              <div className="media-frame">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                  alt="DE-GRACE Editorial Model"
                  className="spread-main-img"
                />
                <div className="media-caption-box">
                  <span className="caption-tag">ATELIER ARCHIVE</span>
                  <p className="caption-quote">
                    "True elegance is an intimate dialogue of supreme confidence and quiet power."
                  </p>
                </div>
              </div>
            </div>

            <div className="spread-text-content" data-aos="fade-left">
              <span className="spread-kicker">THE MAISON MANIFESTO</span>
              <h2 className="spread-title">
                WHERE GRACE BECOMES <br />
                <em>AN UNFORGETTABLE LEGACY</em>
              </h2>
              <div className="spread-divider-gold"></div>
              <p className="spread-body">
                Founded upon principles of absolute grandeur and artisanal perfection, 
                <strong> DE-GRACE CLASSIC BOUTIQUE</strong> transcends fleeting trends.
                Every garment, handbag, and timepiece is curated through meticulous quality standards,
                ensuring that you wear not mere clothing, but a triumph of fine craftsmanship.
              </p>
              <p className="spread-body">
                From our private fitting salons to your residence, we orchestrate an uncompromising luxury 
                experience with private styling consultations, custom alterations, and discrete worldwide courier.
              </p>

              <div className="spread-signature-group">
                <div className="signature-text">
                  <span className="sig-name">DE-GRACE</span>
                  <span className="sig-role">Creative Direction & Haute Horlogerie</span>
                </div>
                <Link to="/products" className="btn-editorial-outline">
                  READ THE EDITORIAL DISPATCH
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: FEATURED RUNWAY PIECES (DYNAMIC PRODUCTS)
        ========================================================================= */}
        <section className="magazine-section runway-showcase" data-aos="fade-up">
          <div className="section-header-editorial text-center">
            <span className="section-issue-number">CHAPTER 02</span>
            <h2 className="section-editorial-title">
              THE RUNWAY <em>COLLECTION</em>
            </h2>
            <p className="section-editorial-desc mx-auto">
              Curated by our head curators. Impeccable finishes, rare fabrics, and quintessential silhouettes.
            </p>

            <div className="editorial-filter-tabs">
              <button
                className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                ALL PIECES
              </button>
              <button
                className={`filter-tab ${activeTab === 'exclusive' ? 'active' : ''}`}
                onClick={() => setActiveTab('exclusive')}
              >
                EXCLUSIVE DROPS
              </button>
              <button
                className={`filter-tab ${activeTab === 'vault' ? 'active' : ''}`}
                onClick={() => setActiveTab('vault')}
              >
                THE HIGH VAULT
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-magazine">
              <div className="boutique-spinner"></div>
              <p>Curating the runway collection from boutique server...</p>
            </div>
          ) : (
            <div className="magazine-products-grid">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="runway-footer-action">
            <Link to="/products" className="btn-magazine-full-archive">
              <span>EXPLORE ALL ARCHIVES ({featuredProducts.length}+ PIECES)</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: FASHION LOOKBOOK SPREAD
        ========================================================================= */}
        <section className="magazine-section lookbook-spread" data-aos="fade-up">
          <div className="lookbook-banner">
            <div className="lookbook-overlay"></div>
            <div className="lookbook-content" data-aos="zoom-in">
              <span className="lookbook-tag">SEASONAL CAPSULE</span>
              <h2 className="lookbook-title">
                THE MONOCHROME & <em>GOLD EMBROIDERED</em> EDIT
              </h2>
              <p className="lookbook-desc">
                An ode to dramatic presence. Explore hand-cut tuxedo lapels,
                cascading silk crepes, and polished bullion embroidery.
              </p>
              <Link to="/products?sort=price_high" className="btn-hero-gold-glow">
                <span>VIEW THE LOOKBOOK</span>
                <span className="btn-arrow-move">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: BOUTIQUE CONCIERGE & TRUST PILLARS
        ========================================================================= */}
        <section className="magazine-section concierge-pillars" data-aos="fade-up">
          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">⚜️</div>
              <h4 className="pillar-title">100% AUTHENTIC COUTURE</h4>
              <p className="pillar-text">
                Every creation carries our embossed Certificate of Authenticity and artisan serial.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">📦</div>
              <h4 className="pillar-title">WHITE-GLOVE DISPATCH</h4>
              <p className="pillar-text">
                Complimentary luxury signature packaging with discreet insured courier delivery.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">✂️</div>
              <h4 className="pillar-title">BESPOKE ALTERATIONS</h4>
              <p className="pillar-text">
                Access private tailoring and bespoke size adjustments through our client concierge.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">🔒</div>
              <h4 className="pillar-title">PRIVÉ ENCRYPTION</h4>
              <p className="pillar-text">
                High-tier financial security ensuring private and encrypted settlement at checkout.
              </p>
            </div>
          </div>
        </section>

      <Footer />
    </div>
  );
}

export default Home;