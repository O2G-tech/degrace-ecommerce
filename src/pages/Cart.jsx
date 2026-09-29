
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

function Cart() {

    const navigate = useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Cart State
    |--------------------------------------------------------------------------
    */

    const [items, setItems] = useState([]);

    const [subtotal, setSubtotal] = useState(0);

    const [delivery, setDelivery] = useState(0);

    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load Cart
    |--------------------------------------------------------------------------
    */

    const loadCart = async () => {

        try {

            setLoading(true);
            setError("");

            const result = await getCart();

            console.log(
                "========== CART RESPONSE =========="
            );

            console.log(result);

            console.log(
                "CART ITEMS:",
                result?.data?.items
            );

            console.log(
                "==================================="
            );


            if (!result || !result.success) {

                setError(
                    result?.message ||
                    "Failed to load cart"
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | Get cart items
            |--------------------------------------------------------------------------
            */

            const cartItems =
                result.data?.items || [];


            setItems(cartItems);


            /*
            |--------------------------------------------------------------------------
            | Calculate subtotal
            |--------------------------------------------------------------------------
            */

            let calculatedSubtotal = 0;


            cartItems.forEach((item) => {

                const price =
                    Number(item.price || 0);

                const quantity =
                    Number(item.quantity || 0);

                calculatedSubtotal +=
                    price * quantity;

            });


            /*
            |--------------------------------------------------------------------------
            | Use backend subtotal if available
            |--------------------------------------------------------------------------
            */

            const backendSubtotal =
                Number(
                    result.data?.subtotal
                );


            if (
                !isNaN(backendSubtotal) &&
                backendSubtotal > 0
            ) {

                setSubtotal(
                    backendSubtotal
                );

            } else {

                setSubtotal(
                    calculatedSubtotal
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Delivery
            |--------------------------------------------------------------------------
            */

            const deliveryFee =
                Number(
                    result.data?.delivery ??
                    result.data?.delivery_fee ??
                    5000
                );


            setDelivery(
                isNaN(deliveryFee)
                    ? 5000
                    : deliveryFee
            );


            /*
            |--------------------------------------------------------------------------
            | Total
            |--------------------------------------------------------------------------
            */

            const backendTotal =
                Number(
                    result.data?.total
                );


            if (
                !isNaN(backendTotal) &&
                backendTotal > 0
            ) {

                setTotal(
                    backendTotal
                );

            } else {

                const finalSubtotal =
                    !isNaN(backendSubtotal) &&
                    backendSubtotal > 0
                        ? backendSubtotal
                        : calculatedSubtotal;


                setTotal(
                    finalSubtotal +
                    (
                        isNaN(deliveryFee)
                            ? 5000
                            : deliveryFee
                    )
                );

            }

        } catch (error) {

            console.error(
                "CART ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            if (
                error.response?.status === 401
            ) {

                setError(
                    "Please login to view your cart."
                );

                return;
            }


            setError(
                error.response?.data?.message ||
                "Failed to load cart. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Load cart when page opens
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadCart();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Get Cart Item ID
    |--------------------------------------------------------------------------
    |
    | Your cart API may return either:
    |
    | cart_item_id
    | OR
    | id
    |
    | This function handles both.
    |--------------------------------------------------------------------------
    */

    const getCartItemId = (item) => {

        return (
            item.cart_item_id ??
            item.id ??
            null
        );

    };


    /*
    |--------------------------------------------------------------------------
    | Increase Quantity
    |--------------------------------------------------------------------------
    */

    const increaseQuantity = async (item) => {

        const cartItemId =
            getCartItemId(item);


        if (!cartItemId) {

            alert(
                "Cart item ID is missing."
            );

            console.error(
                "INVALID CART ITEM:",
                item
            );

            return;
        }


        try {

            const result =
                await updateCartItem(
                    cartItemId,
                    Number(item.quantity) + 1
                );


            console.log(
                "UPDATE QUANTITY RESPONSE:",
                result
            );


            if (!result.success) {

                alert(
                    result.message ||
                    "Failed to update quantity"
                );

                return;
            }


            await loadCart();

        } catch (error) {

            console.error(
                "INCREASE QUANTITY ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Failed to update quantity"
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Decrease Quantity
    |--------------------------------------------------------------------------
    */

    const decreaseQuantity = async (item) => {

        const quantity =
            Number(item.quantity);


        if (quantity <= 1) {

            return;

        }


        const cartItemId =
            getCartItemId(item);


        if (!cartItemId) {

            alert(
                "Cart item ID is missing."
            );

            console.error(
                "INVALID CART ITEM:",
                item
            );

            return;
        }


        try {

            const result =
                await updateCartItem(
                    cartItemId,
                    quantity - 1
                );


            console.log(
                "DECREASE RESPONSE:",
                result
            );


            if (!result.success) {

                alert(
                    result.message ||
                    "Failed to update quantity"
                );

                return;
            }


            await loadCart();

        } catch (error) {

            console.error(
                "DECREASE QUANTITY ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Failed to update quantity"
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Remove Product
    |--------------------------------------------------------------------------
    */

    const handleRemove = async (item) => {

        const cartItemId =
            getCartItemId(item);


        console.log(
            "========== REMOVE CART ITEM =========="
        );

        console.log(
            "Cart Item:",
            item
        );

        console.log(
            "Cart Item ID:",
            cartItemId
        );

        console.log(
            "Product ID:",
            item.product_id
        );

        console.log(
            "======================================="
        );


        if (!cartItemId) {

            alert(
                "Invalid cart item. Cart item ID is missing."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Remove ${item.name || "this product"} from your cart?`
            );


        if (!confirmed) {

            return;

        }


        try {

            const result =
                await removeFromCart(
                    cartItemId
                );


            console.log(
                "REMOVE RESPONSE:",
                result
            );


            if (result.success) {

                /*
                |--------------------------------------------------------------------------
                | Remove immediately from screen
                |--------------------------------------------------------------------------
                */

                setItems((currentItems) =>
                    currentItems.filter(
                        (cartItem) =>
                            getCartItemId(cartItem) !==
                            cartItemId
                    )
                );


                /*
                |--------------------------------------------------------------------------
                | Reload cart totals from backend
                |--------------------------------------------------------------------------
                */

                await loadCart();


            } else {

                alert(
                    result.message ||
                    "Failed to remove product"
                );

            }

        } catch (error) {

            console.error(
                "REMOVE CART ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Failed to remove product from cart"
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Format Currency
    |--------------------------------------------------------------------------
    */

    const formatPrice = (value) => {

        return `₦${Number(
            value || 0
        ).toLocaleString()}`;

    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <>
            <Navbar />


            <main className="cart-page">

                <h1>
                    Shopping Cart
                </h1>


                {/* ==========================================================
                    LOADING
                ========================================================== */}

                {loading && (

                    <div className="cart-message">

                        <p>
                            Loading cart...
                        </p>

                    </div>

                )}


                {/* ==========================================================
                    ERROR
                ========================================================== */}

                {error && !loading && (

                    <div className="cart-message">

                        <p className="error">
                            {error}
                        </p>


                        {error
                            .toLowerCase()
                            .includes("login") && (

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/login?redirect=/cart"
                                    )
                                }
                            >
                                Login
                            </button>

                        )}

                    </div>

                )}


                {/* ==========================================================
                    EMPTY CART
                ========================================================== */}

                {!loading &&
                    !error &&
                    items.length === 0 && (

                    <div className="empty-cart">

                        <h2>
                            Your cart is empty
                        </h2>


                        <p>
                            You haven't added any
                            products yet.
                        </p>


                        <Link
                            to="/products"
                            className="continue-shopping"
                        >
                            Continue Shopping
                        </Link>

                    </div>

                )}


                {/* ==========================================================
                    CART
                ========================================================== */}

                {!loading &&
                    !error &&
                    items.length > 0 && (

                    <div className="cart-container">


                        {/* ==================================================
                            PRODUCTS
                        ================================================== */}

                        <section className="cart-items">

                            {items.map((item) => {

                                const cartItemId =
                                    getCartItemId(item);


                                const price =
                                    Number(
                                        item.price || 0
                                    );


                                const quantity =
                                    Number(
                                        item.quantity || 0
                                    );


                                const itemTotal =
                                    item.item_total !==
                                    undefined
                                        ? Number(
                                            item.item_total
                                        )
                                        : price *
                                          quantity;


                                return (

                                    <div
                                        className="cart-item"
                                        key={
                                            cartItemId ||
                                            item.product_id
                                        }
                                    >


                                        {/* ==================================
                                            IMAGE
                                        ================================== */}

                                        <div className="cart-item-image">

                                            {item.image ? (

                                                <img
                                                    src={getImageUrl("products", item.image)}
                                                    alt={
                                                        item.name
                                                    }
                                                />

                                            ) : (

                                                <div className="no-image">

                                                    No Image

                                                </div>

                                            )}

                                        </div>


                                        {/* ==================================
                                            DETAILS
                                        ================================== */}

                                        <div className="cart-item-details">

                                            <h3>
                                                {item.name}
                                            </h3>


                                            <p>
                                                {formatPrice(
                                                    item.price
                                                )}
                                            </p>


                                            {item.stock !==
                                                undefined && (

                                                <p>
                                                    Stock:{" "}
                                                    {item.stock}
                                                </p>

                                            )}


                                            {/* ==============================
                                                QUANTITY
                                            ============================== */}

                                            <div className="quantity-controls">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        quantity <=
                                                        1
                                                    }
                                                >
                                                    −
                                                </button>


                                                <span>
                                                    {quantity}
                                                </span>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>


                                            {/* ==============================
                                                ITEM TOTAL
                                            ============================== */}

                                            <strong>

                                                Item Total:{" "}

                                                {formatPrice(
                                                    itemTotal
                                                )}

                                            </strong>


                                            <br />


                                            {/* ==============================
                                                REMOVE
                                            ============================== */}

                                            <button
                                                type="button"
                                                className="remove-button"
                                                onClick={() =>
                                                    handleRemove(
                                                        item
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                );

                            })}

                        </section>


                        {/* ==================================================
                            ORDER SUMMARY
                        ================================================== */}

                        <aside className="cart-summary">

                            <h2>
                                Order Summary
                            </h2>


                            <div>

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    {formatPrice(
                                        subtotal
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Delivery
                                </span>

                                <strong>
                                    {formatPrice(
                                        delivery
                                    )}
                                </strong>

                            </div>


                            <hr />


                            <div className="cart-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatPrice(
                                        total
                                    )}
                                </strong>

                            </div>


                            <button
                                type="button"
                                className="checkout-btn"
                                onClick={() =>
                                    navigate(
                                        "/checkout"
                                    )
                                }
                            >
                                Proceed to Checkout
                            </button>


                            <Link
                                to="/products"
                                className="continue-shopping"
                            >
                                Continue Shopping
                            </Link>

                        </aside>

                    </div>

                )}

            </main>


            <Footer />

        </>

    );

}


export default Cart;
