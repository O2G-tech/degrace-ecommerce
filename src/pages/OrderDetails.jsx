
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


                {/* Interactive Luxury Order Tracker */}
                <div className="order-tracker-card" style={{ background: '#121212', color: '#f5f3ef', borderRadius: '12px', padding: '24px', marginBottom: '28px', border: '1px solid rgba(197, 160, 89, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', color: '#c5a059', textTransform: 'uppercase' }}>Live Consignment Tracker</span>
                            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>Tracking Order: #{order.order_number}</h3>
                        </div>
                        <span style={{ background: order.status === 'Delivered' || order.status === 'Completed' ? '#2e7d32' : (order.status === 'Shipped' ? '#1565c0' : (order.status === 'Processing' ? '#e65100' : '#c5a059')), color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '6px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {order.status || 'Pending'}
                        </span>
                    </div>

                    {/* Timeline Steps */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', position: 'relative', marginTop: '16px' }}>
                        {[
                            { label: 'Order Confirmed', step: 1, desc: 'Logged in Maison records', active: true },
                            { label: 'Atelier Processing', step: 2, desc: 'Quality inspection & prep', active: ['Processing', 'Shipped', 'Delivered', 'Completed'].includes(order.status) },
                            { label: 'Dispatched / In Transit', step: 3, desc: 'White-glove courier', active: ['Shipped', 'Delivered', 'Completed'].includes(order.status) },
                            { label: 'Delivered & Complete', step: 4, desc: 'Safely received', active: ['Delivered', 'Completed'].includes(order.status) }
                        ].map((s, idx) => (
                            <div key={idx} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: '8px', background: s.active ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255,255,255,0.03)', border: s.active ? '1px solid #c5a059' : '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.active ? '#c5a059' : '#333', color: s.active ? '#121212' : '#888', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontSize: '0.85rem' }}>
                                    {s.active ? '✓' : s.step}
                                </div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.active ? '#ffffff' : '#777', marginBottom: '2px' }}>{s.label}</div>
                                <div style={{ fontSize: '0.68rem', color: s.active ? '#c5a059' : '#555' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
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
