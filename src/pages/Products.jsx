import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCards";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FALLBACK_CATALOGUE = [
  { id: "sample-1", name: "Sovereign Gold Embroidered Silk Velvet Gown", price: 345000, category_name: "Haute Couture", majority_rating: 5, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-2", name: "Venetian Midnight Double-Breasted Cashmere Blazer", price: 280000, category_name: "Bespoke Suiting", majority_rating: 5, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-3", name: "Florence Hand-Stitched Florentine Calfskin Tote", price: 195000, category_name: "Artisan Leather", majority_rating: 5, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-4", name: "Celestial Chronometer 18K Rose Gold Edition", price: 650000, category_name: "Fine Horology", majority_rating: 5, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-5", name: "Starlight Diamond Cascade Chandelier Earrings", price: 420000, category_name: "Statement Jewelry", majority_rating: 5, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-6", name: "Monogrammed Milanese Suede Dress Loafers", price: 175000, category_name: "Designer Footwear", majority_rating: 5, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-7", name: "Aura Pleated Metallic Lamé Evening Cape", price: 310000, category_name: "Haute Couture", majority_rating: 5, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80" },
  { id: "sample-8", name: "Savile Row Silk Peak-Lapel Smoking Tuxedo", price: 490000, category_name: "Bespoke Suiting", majority_rating: 5, image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80" },
];

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryId = searchParams.get("category_id");
    const initialSearch = searchParams.get("search") || "";

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState(initialSearch);
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    // Load available categories for filter bar
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await getCategories();
                if (res && res.success && res.data) {
                    setCategories(res.data);
                }
            } catch (err) {
                console.warn("Could not load categories for filters:", err);
            }
        };
        fetchCats();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getProducts({
                page,
                limit: 12,
                search,
                category_id: categoryId || "",
                sort
            });

            if (result && result.success && result.data && result.data.products && result.data.products.length > 0) {
                setProducts(result.data.products);
                setPagination(result.data.pagination || {});
            } else {
                // If backend has no products yet or filtered empty
                if (search || categoryId) {
                    setProducts([]);
                } else {
                    setProducts(FALLBACK_CATALOGUE);
                }
            }
        } catch (err) {
            console.warn("Backend products error, falling back to curated editorial pieces:", err);
            setProducts(FALLBACK_CATALOGUE);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, sort, categoryId]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (page === 1) {
            loadProducts();
        } else {
            setPage(1);
        }
    };

    return (
        <div className="magazine-layout">
            <Navbar />

            <main className="magazine-section catalogue-page" style={{ margin: "3rem auto 6rem" }}>
                {/* Editorial Breadcrumbs */}
                <div className="breadcrumb-nav">
                    <Link to="/">HOME</Link>
                    <span>/</span>
                    <span className="current">THE RUNWAY ARCHIVE</span>
                </div>

                {/* Editorial Header */}
                <div className="section-header-editorial">
                    <div className="header-meta">
                        <span className="section-issue-number">DE-GRACE ATELIER</span>
                        <span className="section-category-label">SEASONAL ARCHIVE</span>
                    </div>
                    <h1 className="section-editorial-title">
                        THE COUTURE <em>COLLECTION</em>
                    </h1>
                    <p className="section-editorial-desc">
                        Impeccably tailored garments, precious accessories, and limited capsule releases.
                    </p>
                </div>

                {/* Filter and Control Bar */}
                <div style={{ background: "#ffffff", border: "1px solid var(--border-light)", borderRadius: "4px", padding: "1.25rem 1.5rem", marginBottom: "3rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", boxShadow: "var(--shadow-subtle)" }}>
                    {/* Search inside collection */}
                    <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flex: 1, maxWidth: "420px" }}>
                        <input
                            type="search"
                            placeholder="Filter by keyword, silk, suit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, padding: "9px 14px", border: "1px solid var(--border-light)", borderRadius: "3px", fontSize: "0.9rem", outline: "none" }}
                        />
                        <button
                            type="submit"
                            style={{ padding: "9px 18px", background: "var(--bg-dark)", color: "#dfc285", border: "none", borderRadius: "3px", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", cursor: "pointer" }}
                        >
                            FILTER
                        </button>
                    </form>

                    {/* Sorting selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--ink-muted)", textTransform: "uppercase" }}>
                            ARRANGE:
                        </label>
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            style={{ padding: "9px 14px", border: "1px solid var(--border-light)", borderRadius: "3px", background: "#ffffff", fontSize: "0.85rem", cursor: "pointer", outline: "none" }}
                        >
                            <option value="latest">Latest Acquisitions</option>
                            <option value="price_low">Price: Ascending</option>
                            <option value="price_high">Price: Haute Prestige</option>
                            <option value="name_asc">Title: A to Z</option>
                            <option value="name_desc">Title: Z to A</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills if categories exist */}
                {categories.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "2.5rem" }}>
                        <Link
                            to="/products"
                            style={{ padding: "6px 16px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", background: !categoryId ? "#0b0b0d" : "#ffffff", color: !categoryId ? "#dfc285" : "var(--ink-muted)", border: "1px solid var(--border-light)" }}
                        >
                            All Categories
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?category_id=${cat.id}`}
                                style={{ padding: "6px 16px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", background: categoryId === String(cat.id) ? "#0b0b0d" : "#ffffff", color: categoryId === String(cat.id) ? "#dfc285" : "var(--ink-muted)", border: "1px solid var(--border-light)" }}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* State: Loading */}
                {loading ? (
                    <div className="loading-magazine">
                        <div className="boutique-spinner"></div>
                        <p>Curating boutique collection...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="error-magazine-box">
                        <h2>No Pieces Found</h2>
                        <p>No creations match your current query or category filter.</p>
                        <button
                            className="btn-magazine-primary"
                            onClick={() => {
                                setSearch("");
                                setSearchParams({});
                            }}
                        >
                            <span>RESET CURATION</span>
                            <span className="btn-arrow">→</span>
                        </button>
                    </div>
                ) : (
                    /* Products Grid */
                    <div className="magazine-products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "4.5rem" }}>
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            style={{ padding: "10px 22px", background: page <= 1 ? "transparent" : "#0b0b0d", color: page <= 1 ? "var(--ink-muted)" : "#dfc285", border: "1px solid var(--border-light)", borderRadius: "2px", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em" }}
                        >
                            ← PREVIOUS
                        </button>

                        <span style={{ fontSize: "0.85rem", color: "var(--ink-muted)", letterSpacing: "0.08em" }}>
                            FOLIO {page} OF {pagination.total_pages}
                        </span>

                        <button
                            disabled={page >= pagination.total_pages}
                            onClick={() => setPage(page + 1)}
                            style={{ padding: "10px 22px", background: page >= pagination.total_pages ? "transparent" : "#0b0b0d", color: page >= pagination.total_pages ? "var(--ink-muted)" : "#dfc285", border: "1px solid var(--border-light)", borderRadius: "2px", cursor: page >= pagination.total_pages ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em" }}
                        >
                            NEXT →
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Products;
