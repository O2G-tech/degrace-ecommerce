import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../services/cartService";
import { getImageUrl } from "../services/api";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setAdding(true);
            const result = await addToCart(product.id, 1);

            if (result.success) {
                setAdded(true);
                setTimeout(() => setAdded(false), 2200);
            } else {
                alert(result.message || "Unable to add piece to shopping bag");
            }
        } catch (error) {
            console.error("ADD TO CART ERROR:", error);
            if (error.response && error.response.status === 401) {
                alert("Please sign in to your client account to add to shopping bag.");
                navigate("/login");
            } else {
                alert("Could not connect to boutique server. Please try again.");
            }
        } finally {
            setAdding(false);
        }
    };

    const imageUrl = product.image ? getImageUrl("products", product.image) : "";

    return (
        <div className="product-card" data-aos="fade-up">
            <Link to={`/products/${product.id}`} className="product-link">
                <div className="product-image-container">
                    <span className="product-tag-pill">DE-GRACE EXCLUSIVE</span>
                    
                    {imageUrl && !imgError ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="product-image"
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="no-image-magazine">
                            <span className="no-image-monogram">DG</span>
                            <span className="no-image-text">DE-GRACE COUTURE</span>
                        </div>
                    )}

                    <div className="quick-action-overlay">
                        <button
                            type="button"
                            className={`magazine-cart-btn ${added ? 'btn-success' : ''}`}
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {added ? "ADDED TO BAG ✓" : adding ? "ADDING..." : "ADD TO BAG"}
                        </button>
                    </div>
                </div>

                <div className="product-info">
                    <p className="product-category-eyebrow">
                        {product.category_name || "CURATED COUTURE"}
                    </p>

                    <h3 className="product-title">
                        {product.name}
                    </h3>

                    <div className="product-rating" aria-label={`${product.majority_rating || 5} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, starIndex) => (
                            <span
                                className={starIndex < (Number(product.majority_rating) || 5) ? "filled" : "empty"}
                                key={starIndex}
                            >
                                ★
                            </span>
                        ))}
                        <span className="rating-count">({product.majority_rating || "5.0"})</span>
                    </div>

                    <div className="product-price-wrapper">
                        <span className="currency-symbol">₦</span>
                        <span className="product-price">
                            {Number(product.price).toLocaleString()}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default ProductCard;
