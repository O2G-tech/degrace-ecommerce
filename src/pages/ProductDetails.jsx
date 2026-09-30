import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProduct } from "../services/productService";
import { getProductReviews, createReview } from "../services/reviewService";
import { addToCart } from "../services/cartService";
import { getImageUrl } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [activeImage, setActiveImage] = useState("");

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const result = await getProduct(id);

                if (!result.success || !result.data) {
                    // Check fallback or sample products
                    setError(result.message || "Piece not found in collection");
                    return;
                }

                setProduct(result.data);
                const firstImg = result.data.images?.[0]?.image || result.data.image || "";
                setActiveImage(firstImg);
            } catch (err) {
                console.error("PRODUCT DETAILS LOAD ERROR:", err);
                setError("Unable to connect to boutique server.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id]);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const result = await getProductReviews(id);
                if (result.success) {
                    setReviews(result.data?.reviews || []);
                }
            } catch (err) {
                console.error("REVIEW LOAD ERROR:", err);
            }
        };

        if (id) {
            loadReviews();
        }
    }, [id]);

    const handleAddToCart = async () => {
        try {
            setAdding(true);
            const result = await addToCart(product.id, quantity);

            if (result.success) {
                setAdded(true);
                setTimeout(() => setAdded(false), 2500);
            } else {
                alert(result.message || "Failed to add piece to shopping bag");
            }
        } catch (err) {
            console.error("ADD TO CART ERROR:", err);
            const status = err.response?.status;
            const message = err.response?.data?.message;

            if (status === 401 || status === 403) {
                alert("Your session has expired or you need to sign in. Please log in to your client account.");
                navigate("/login");
            } else if (message) {
                alert(message);
            } else {
                alert("Could not add item to bag. Please ensure you are logged in.");
            }
        } finally {
            setAdding(false);
        }
    };

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        try {
            setReviewLoading(true);
            setReviewMessage("");

            const result = await createReview(id, { rating, comment });

            if (result.success) {
                setReviewMessage("Review recorded in Maison archives.");
                setComment("");
                // Reload reviews
                const updatedReviews = await getProductReviews(id);
                if (updatedReviews.success) {
                    setReviews(updatedReviews.data?.reviews || []);
                }
            } else {
                setReviewMessage(result.message || "Unable to submit review");
            }
        } catch (err) {
            console.error("SUBMIT REVIEW ERROR:", err);
            setReviewMessage(err.response?.data?.message || "Please login to submit client review.");
        } finally {
            setReviewLoading(false);
        }
    };

    const displayImage = activeImage ? getImageUrl("products", activeImage) : (product?.image ? getImageUrl("products", product.image) : "");

    return (
        <div className="magazine-layout">
            <Navbar />

            <main className="page-container product-details-wrapper">
                <div className="breadcrumb-nav">
                    <Link to="/">HOME</Link>
                    <span>/</span>
                    <Link to="/products">COLLECTION</Link>
                    <span>/</span>
                    <span className="current">{product ? product.name : "DETAILS"}</span>
                </div>

                {loading ? (
                    <div className="loading-magazine">
                        <div className="boutique-spinner"></div>
                        <p>Presenting couture details...</p>
                    </div>
                ) : error ? (
                    <div className="error-magazine-box">
                        <h2>Maison Notice</h2>
                        <p>{error}</p>
                        <Link to="/products" className="btn-magazine-primary">
                            <span>RETURN TO COLLECTIONS</span>
                            <span className="btn-arrow">→</span>
                        </Link>
                    </div>
                ) : product ? (
                    <>
                        <div className="product-details-grid">
                            {/* Left: Gallery */}
                            <div className="product-gallery">
                                <div className="product-main-media">
                                    {displayImage ? (
                                        <img src={displayImage} alt={product.name} />
                                    ) : (
                                        <div className="no-image-magazine" style={{ height: "480px" }}>
                                            <span className="no-image-monogram">DG</span>
                                            <span className="no-image-text">DE-GRACE COUTURE</span>
                                        </div>
                                    )}
                                </div>

                                {product.images && product.images.length > 1 && (
                                    <div className="product-thumbnails">
                                        {product.images.map((img) => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                className={`thumb-btn ${activeImage === img.image ? 'active' : ''}`}
                                                onClick={() => setActiveImage(img.image)}
                                            >
                                                <img src={getImageUrl("products", img.image)} alt="Thumbnail" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Info */}
                            <div className="product-summary">
                                <span className="edition-tag">
                                    {product.category_name || "HAUTE COUTURE"}
                                </span>

                                <h1 className="product-headline">{product.name}</h1>

                                <div className="product-rating" aria-label={`${product.majority_rating || 5} out of 5 stars`}>
                                    {Array.from({ length: 5 }, (_, starIndex) => (
                                        <span
                                            className={starIndex < (Number(product.majority_rating) || 5) ? "filled" : "empty"}
                                            key={starIndex}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="rating-count">({reviews.length} Verified Client Reviews)</span>
                                </div>

                                <div className="price-tag-magazine">
                                    <span className="currency-mark">₦</span>
                                    <span className="amount">{Number(product.price).toLocaleString()}</span>
                                </div>

                                <div className="product-editorial-desc">
                                    <p>{product.description || "Handcrafted with the highest degree of artisan mastery. Exceptional drape, bespoke hardware, and signature DE-GRACE tailoring."}</p>
                                </div>

                                <div className="product-meta-specs">
                                    <div className="spec-row">
                                        <span className="spec-label">AVAILABILITY:</span>
                                        <span className="spec-val">
                                            {product.stock > 0 ? `In Atelier Stock (${product.stock} pieces)` : "Made-To-Order"}
                                        </span>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-label">AUTHENTICITY:</span>
                                        <span className="spec-val">Certificate & Serial Included</span>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-label">DISPATCH:</span>
                                        <span className="spec-val">Complimentary White-Glove Courier</span>
                                    </div>
                                </div>

                                {/* Quantity & Add to Cart */}
                                <div className="purchase-controls">
                                    <div className="quantity-selector">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span>{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className={`btn-add-bag ${added ? 'added' : ''}`}
                                        onClick={handleAddToCart}
                                        disabled={adding}
                                    >
                                        {added ? "ADDED TO SHOPPING BAG ✓" : adding ? "ACQUIRING..." : "ADD TO SHOPPING BAG"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reviews & Client Endorsements */}
                        <section className="reviews-section-editorial">
                            <div className="section-header-editorial">
                                <span className="section-issue-number">CLIENT CRITIQUE</span>
                                <h2 className="section-editorial-title">
                                    PATRON <em>IMPRESSIONS</em>
                                </h2>
                            </div>

                            <div className="reviews-layout">
                                <div className="reviews-list">
                                    {reviews.length === 0 ? (
                                        <p className="no-reviews-note">
                                            No patron impressions published yet for this piece. Be the premier client to record an endorsement.
                                        </p>
                                    ) : (
                                        reviews.map((rev) => (
                                            <div key={rev.id} className="review-card-editorial">
                                                <div className="review-header">
                                                    <span className="reviewer-name">{rev.user_name || "Verified Client"}</span>
                                                    <div className="review-rating">
                                                        {Array.from({ length: 5 }, (_, idx) => (
                                                            <span key={idx} className={idx < Number(rev.rating) ? "filled" : "empty"}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-comment">{rev.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="write-review-editorial">
                                    <h3>RECORD CLIENT ENDORSEMENT</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <label>Rating Evaluation</label>
                                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                                            <option value={5}>5 Stars — Exquisite & Flawless</option>
                                            <option value={4}>4 Stars — Exceptional Quality</option>
                                            <option value={3}>3 Stars — Satisfactory</option>
                                            <option value={2}>2 Stars — Below Expectations</option>
                                            <option value={1}>1 Star — Unsatisfactory</option>
                                        </select>

                                        <label>Patron Critique</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Detail your impression of the fabric, silhouette, and craftsmanship..."
                                            rows={4}
                                            required
                                        ></textarea>

                                        <button type="submit" disabled={reviewLoading} className="btn-magazine-primary">
                                            <span>{reviewLoading ? "RECORDING..." : "TRANSMIT ENDORSEMENT"}</span>
                                            <span className="btn-arrow">→</span>
                                        </button>
                                    </form>

                                    {reviewMessage && <p className="review-feedback-msg">{reviewMessage}</p>}
                                </div>
                            </div>
                        </section>
                    </>
                ) : null}
            </main>

            <Footer />
        </div>
    );
}

export default ProductDetails;