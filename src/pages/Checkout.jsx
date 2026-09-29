import { createOrder } from "../services/orderService";
import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    getCart
} from "../services/cartService";

import {
    initializePayment
} from "../services/paymentService";


function Checkout() {

    const navigate = useNavigate();


    /*
    |--------------------------------------------------------------------------
    | Form data
    |--------------------------------------------------------------------------
    */

    const [formData, setFormData] = useState({

        full_name: "",
        phone: "",
        email: "",
        address: "",
        state: "",
        city: "",
        postal_code: ""

    });


    /*
    |--------------------------------------------------------------------------
    | Delivery and payment
    |--------------------------------------------------------------------------
    */

    const [deliveryMethod, setDeliveryMethod] =
        useState("standard");


    const [paymentMethod, setPaymentMethod] =
        useState("pay_on_delivery");


    /*
    |--------------------------------------------------------------------------
    | Cart
    |--------------------------------------------------------------------------
    */

    const [cart, setCart] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Delivery prices
    |--------------------------------------------------------------------------
    */

    const deliveryPrices = {

        standard: 5000,

        express: 10000

    };


    /*
    |--------------------------------------------------------------------------
    | Load cart
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const loadCart = async () => {

            try {

                setLoading(true);

                setError("");


                const result =
                    await getCart();


                console.log(
                    "CHECKOUT CART:",
                    result
                );


                if (!result.success) {

                    setError(
                        result.message ||
                        "Failed to load cart"
                    );

                    return;
                }


                /*
                |--------------------------------------------------------------------------
                | Don't allow checkout with empty cart
                |--------------------------------------------------------------------------
                */

                if (
                    !result.data ||
                    !result.data.items ||
                    result.data.items.length === 0
                ) {

                    setError(
                        "Your cart is empty."
                    );

                    return;
                }


                setCart(
                    result.data
                );


            } catch (error) {

                console.error(
                    "CHECKOUT ERROR:",
                    error
                );


                if (
                    error.response?.status === 401
                ) {

                    navigate(
                        "/login?redirect=/checkout"
                    );

                    return;

                }


                setError(
                    "Failed to load checkout."
                );


            } finally {

                setLoading(false);

            }

        };


        loadCart();

    }, [navigate]);


    /*
    |--------------------------------------------------------------------------
    | Handle input
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData({

            ...formData,

            [name]: value

        });

    };


    /*
    |--------------------------------------------------------------------------
    | Submit checkout information
    |--------------------------------------------------------------------------
    */

     
const handleSubmit = async (e) => {

    e.preventDefault();


    /*
    |--------------------------------------------------------------------------
    | Validate form
    |--------------------------------------------------------------------------
    */

    if (
        !formData.full_name ||
        !formData.phone ||
        !formData.email ||
        !formData.address ||
        !formData.state ||
        !formData.city
    ) {

        alert(
            "Please fill in all required fields."
        );

        return;
    }


    try {

        setLoading(true);


        /*
        |--------------------------------------------------------------------------
        | Prepare order data
        |--------------------------------------------------------------------------
        */

        const orderData = {

            full_name:
                formData.full_name,

            phone:
                formData.phone,

            email:
                formData.email,

            address:
                formData.address,

            state:
                formData.state,

            city:
                formData.city,

            postal_code:
                formData.postal_code,

            delivery_method:
                deliveryMethod,

            payment_method:
                paymentMethod

        };


        /*
        |--------------------------------------------------------------------------
        | Create order
        |--------------------------------------------------------------------------
        */

        const result =
            await createOrder(
                orderData
            );


        console.log(
            "CREATE ORDER RESPONSE:",
            result
        );


        if (!result.success) {

            alert(
                result.message ||
                "Failed to create order"
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Save order information
        |--------------------------------------------------------------------------
        */

        localStorage.setItem(

            "lastOrder",

            JSON.stringify(
                result.data
            )

        );


        if (paymentMethod === "online_payment") {

            const payment = await initializePayment(
                result.data.order_id,
                formData.email
            );

            if (!payment.success) {
                alert(
                    payment.message ||
                    "Failed to initialize payment"
                );
                return;
            }

            window.location.assign(
                payment.data.authorization_url
            );

        } else {

            navigate(
                `/orders/${result.data.order_id}`
            );
        }


    } catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        alert(
            "Something went wrong while creating your order."
        );


    } finally {

        setLoading(false);

    }

};




    /*
    |--------------------------------------------------------------------------
    | Format price
    |--------------------------------------------------------------------------
    */

    const formatPrice = (
        value
    ) => {

        return `₦${Number(
            value || 0
        ).toLocaleString()}`;

    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <>

                <Navbar />

                <main className="checkout-page">

                    <p>
                        Loading checkout...
                    </p>

                </main>

                <Footer />

            </>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error) {

        return (

            <>

                <Navbar />

                <main className="checkout-page">

                    <h1>
                        Checkout
                    </h1>


                    <p className="error">
                        {error}
                    </p>


                    <button
                        onClick={() =>
                            navigate(
                                "/cart"
                            )
                        }
                    >
                        Return to Cart
                    </button>

                </main>

                <Footer />

            </>

        );

    }


    return (

        <>

            <Navbar />


            <main className="checkout-page">

                <h1>
                    Checkout
                </h1>


                <form
                    onSubmit={
                        handleSubmit
                    }
                >


                    {/* ======================================================
                        DELIVERY INFORMATION
                    ====================================================== */}

                    <section className="checkout-section">

                        <h2>
                            Delivery Information
                        </h2>


                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="full_name"
                                value={
                                    formData.full_name
                                }
                                onChange={
                                    handleChange
                                }
                                autoComplete="name"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                autoComplete="tel"
                                placeholder="080XXXXXXXX"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                autoComplete="email"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Delivery Address
                            </label>

                            <textarea
                                name="address"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                                autoComplete="street-address"
                                placeholder="Enter your delivery address"
                                required
                            />

                        </div>


                        <div className="checkout-row">


                            <div className="form-group">

                                <label>
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="address-level1"
                                    placeholder="FCT"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="address-level2"
                                    placeholder="Abuja"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Postal Code
                                </label>

                                <input
                                    type="text"
                                    name="postal_code"
                                    value={
                                        formData.postal_code
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="postal-code"
                                    placeholder="Optional"
                                />

                            </div>

                        </div>

                    </section>


                    {/* ======================================================
                        DELIVERY METHOD
                    ====================================================== */}

                    <section className="checkout-section">

                        <h2>
                            Delivery Method
                        </h2>


                        <label className="checkout-option">

                            <input
                                type="radio"
                                name="delivery"
                                value="standard"
                                checked={
                                    deliveryMethod ===
                                    "standard"
                                }
                                onChange={(e) =>
                                    setDeliveryMethod(
                                        e.target.value
                                    )
                                }
                            />


                            <span>

                                <strong>
                                    Standard Delivery
                                </strong>

                                <br />

                                ₦5,000

                            </span>

                        </label>


                        <label className="checkout-option">

                            <input
                                type="radio"
                                name="delivery"
                                value="express"
                                checked={
                                    deliveryMethod ===
                                    "express"
                                }
                                onChange={(e) =>
                                    setDeliveryMethod(
                                        e.target.value
                                    )
                                }
                            />


                            <span>

                                <strong>
                                    Express Delivery
                                </strong>

                                <br />

                                ₦10,000

                            </span>

                        </label>

                    </section>


                    {/* ======================================================
                        PAYMENT METHOD
                    ====================================================== */}

                    <section className="checkout-section">

                        <h2>
                            Payment Method
                        </h2>


                        <label className="checkout-option">

                            <input
                                type="radio"
                                name="payment"
                                value="pay_on_delivery"
                                checked={
                                    paymentMethod ===
                                    "pay_on_delivery"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            />


                            <span>

                                <strong>
                                    Pay on Delivery
                                </strong>

                                <br />

                                Pay when your order arrives.

                            </span>

                        </label>


                        <label className="checkout-option">

                            <input
                                type="radio"
                                name="payment"
                                value="online_payment"
                                checked={
                                    paymentMethod ===
                                    "online_payment"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            />


                            <span>

                                <strong>
                                    Online Payment
                                </strong>

                                <br />

                                Pay securely online.

                            </span>

                        </label>

                    </section>


                    {/* ======================================================
                        ORDER SUMMARY
                    ====================================================== */}

                    {cart && (

                        <section className="checkout-summary">

                            <h2>
                                Order Summary
                            </h2>


                            <p>

                                Subtotal:

                                <strong>
                                    {" "}
                                    {formatPrice(
                                        cart.subtotal
                                    )}
                                </strong>

                            </p>


                            <p>

                                Delivery:

                                <strong>
                                    {" "}
                                    {formatPrice(
                                        deliveryPrices[
                                            deliveryMethod
                                        ]
                                    )}
                                </strong>

                            </p>


                            <hr />


                            <h3>

                                Total:

                                {" "}

                                {formatPrice(
                                    Number(
                                        cart.subtotal
                                    ) +
                                    deliveryPrices[
                                        deliveryMethod
                                    ]
                                )}

                            </h3>

                        </section>

                    )}


                    {/* ======================================================
                        BUTTON
                    ====================================================== */}

                    <button
                        type="submit"
                        className="checkout-button"
                    >
                        Continue to Payment
                    </button>

                </form>

            </main>


            <Footer />

        </>

    );

}


export default Checkout;
