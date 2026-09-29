
import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    getOrder
} from "../services/orderService";
import { getImageUrl } from "../services/api";


function OrderDetails() {

    const {
        id
    } = useParams();


    const [order, setOrder] =
        useState(null);


    const [items, setItems] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadOrder = async () => {

            try {

                setLoading(true);


                const result =
                    await getOrder(id);


                console.log(
                    "ORDER:",
                    result
                );


                if (!result.success) {

                    setError(
                        result.message
                    );

                    return;
                }


                setOrder(
                    result.data.order
                );


                setItems(
                    result.data.items
                );


            } catch (error) {

                console.error(
                    error
                );


                setError(
                    "Failed to load order"
                );


            } finally {

                setLoading(false);

            }

        };


        loadOrder();

    }, [id]);


    const formatPrice = (
        value
    ) => {

        return `₦${Number(
            value || 0
        ).toLocaleString()}`;

    };


    if (loading) {

        return (

            <>

                <Navbar />

                <main>

                    <p>
                        Loading order...
                    </p>

                </main>

                <Footer />

            </>

        );

    }


    if (error) {

        return (

            <>

                <Navbar />

                <main>

                    <p className="error">
                        {error}
                    </p>

                    <Link to="/orders">
                        Back to My Orders
                    </Link>

                </main>

                <Footer />

            </>

        );

    }


    return (

        <>

            <Navbar />


            <main className="order-details">

                <Link to="/orders">

                    ← Back to My Orders

                </Link>


                <h1>

                    Order #

                    {order.order_number}

                </h1>


                <div className="order-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f5f3ef', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(197, 160, 89, 0.3)' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: '#c5a059', textTransform: 'uppercase', display: 'block' }}>Fulfillment &amp; Dispatch Status</span>
                        <strong style={{ fontSize: '1.2rem', textTransform: 'uppercase', color: '#1a1a1a' }}>
                            {order.status}
                        </strong>
                    </div>
                    <span style={{ background: order.status === 'Delivered' ? '#2e7d32' : (order.status === 'Shipped' ? '#1565c0' : (order.status === 'Processing' ? '#e65100' : '#757575')), color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '6px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {order.status}
                    </span>
                </div>

                {order.admin_note && (
                    <section className="admin-message-banner" style={{ background: '#1a1a1a', color: '#f5f3ef', padding: '20px 24px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #c5a059' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', color: '#c5a059', textTransform: 'uppercase', marginBottom: '6px' }}>
                            💬 Concierge Message from Atelier Admin
                        </div>
                        <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                            "{order.admin_note}"
                        </p>
                    </section>
                )}


                <section>

                    <h2>
                        Delivery Information
                    </h2>


                    <p>
                        <strong>Name:</strong>{" "}
                        {order.full_name}
                    </p>


                    <p>
                        <strong>Phone:</strong>{" "}
                        {order.phone}
                    </p>


                    <p>
                        <strong>Email:</strong>{" "}
                        {order.email}
                    </p>


                    <p>
                        <strong>Address:</strong>{" "}
                        {order.address}
                    </p>


                    <p>
                        <strong>City:</strong>{" "}
                        {order.city}
                    </p>


                    <p>
                        <strong>State:</strong>{" "}
                        {order.state}
                    </p>

                </section>


                <section>

                    <h2>
                        Products
                    </h2>


                    {items.map(
                        (item) => (

                            <div
                                key={
                                    item.id
                                }
                                className="order-item"
                            >

                                {item.image && (

                                    <img
                                        src={
                                            getImageUrl("products", item.image)
                                        }
                                        alt={
                                            item.product_name
                                        }
                                        width="80"
                                    />

                                )}


                                <div>

                                    <h3>
                                        {
                                            item.product_name
                                        }
                                    </h3>


                                    <p>

                                        {
                                            formatPrice(
                                                item.price
                                            )
                                        }

                                        {" × "}

                                        {
                                            item.quantity
                                        }

                                    </p>


                                    <strong>

                                        {
                                            formatPrice(
                                                item.subtotal
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>

                        )
                    )}

                </section>


                <section>

                    <h2>
                        Order Summary
                    </h2>


                    <p>

                        Subtotal:

                        {" "}

                        {formatPrice(
                            order.subtotal
                        )}

                    </p>


                    <p>

                        Delivery:

                        {" "}

                        {formatPrice(
                            order.delivery_fee
                        )}

                    </p>


                    <h2>

                        Total:

                        {" "}

                        {formatPrice(
                            order.total
                        )}

                    </h2>

                </section>

            </main>


            <Footer />

        </>

    );

}


export default OrderDetails;
