
import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    getOrders
} from "../services/orderService";


function Orders() {

    const navigate =
        useNavigate();


    const [orders, setOrders] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadOrders = async () => {

            try {

                setLoading(true);

                const result =
                    await getOrders();


                console.log(
                    "ORDERS:",
                    result
                );


                if (!result.success) {

                    setError(
                        result.message
                    );

                    return;
                }


                setOrders(
                    result.data || []
                );


            } catch (error) {

                console.error(
                    error
                );


                if (
                    error.response?.status ===
                    401
                ) {

                    navigate(
                        "/login"
                    );

                    return;
                }


                setError(
                    "Failed to load orders"
                );


            } finally {

                setLoading(false);

            }

        };


        loadOrders();

    }, [navigate]);


    const formatPrice = (
        value
    ) => {

        return `₦${Number(
            value || 0
        ).toLocaleString()}`;

    };


    return (

        <>

            <Navbar />


            <main className="orders-page">

                <h1>
                    My Orders
                </h1>


                {loading && (

                    <p>
                        Loading orders...
                    </p>

                )}


                {error && (

                    <p className="error">
                        {error}
                    </p>

                )}


                {!loading &&
                    !error &&
                    orders.length === 0 && (

                        <div>

                            <p>
                                You don't have any
                                orders yet.
                            </p>


                            <Link to="/products">

                                Start Shopping

                            </Link>

                        </div>

                    )}


                {!loading &&
                    !error &&
                    orders.length > 0 && (

                        <div className="orders-list">

                            {orders.map(
                                (order) => (

                                    <Link
                                        key={
                                            order.id
                                        }
                                        to={
                                            `/orders/${order.id}`
                                        }
                                        className="order-card"
                                    >

                                        <div>

                                            <h3>

                                                Order #

                                                {
                                                    order.order_number
                                                }

                                            </h3>


                                            <p>

                                                Date:

                                                {" "}

                                                {
                                                    new Date(
                                                        order.created_at
                                                    ).toLocaleDateString()
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <strong>

                                                {
                                                    order.status
                                                }

                                            </strong>


                                            <p>

                                                {
                                                    formatPrice(
                                                        order.total
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </Link>

                                )
                            )}

                        </div>

                    )}

            </main>


            <Footer />

        </>

    );

}


export default Orders;

