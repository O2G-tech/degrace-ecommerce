import {
    useEffect,
    useState
} from "react";

import {
    getAdminOrders,
    updateOrderStatus
} from "../../services/orderService";

function AdminOrders() {

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const loadOrders = async () => {

        try {

            const result =
                await getAdminOrders();

            if (result.success) {

                setOrders(
                    result.data
                );
            }

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadOrders();

    }, []);

    const changeStatus = async (
        id,
        status
    ) => {

        try {

            const result =
                await updateOrderStatus(
                    id,
                    status
                );

            if (!result.success) {

                alert(
                    result.message
                );

                return;
            }

            loadOrders();

        } catch (error) {

            console.error(error);

            alert(
                "Failed to update order"
            );
        }
    };

    return (

        <div>

            <h1>
                Orders
            </h1>

            {loading ? (

                <p>
                    Loading orders...
                </p>

            ) : (

                <table>

                    <thead>

                        <tr>

                            <th>
                                Order
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Total
                            </th>

                            <th>
                                Payment
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Date
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {orders.map(
                            (order) => (

                                <tr
                                    key={
                                        order.id
                                    }
                                >

                                    <td>
                                        #
                                        {
                                            order.order_number
                                        }
                                    </td>

                                    <td>
                                        {
                                            order.full_name
                                        }
                                    </td>

                                    <td>
                                        ₦
                                        {Number(
                                            order.total
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {
                                            order.payment_status
                                        }
                                    </td>

                                    <td>

                                        <select
                                            value={
                                                order.status
                                            }
                                            onChange={(e) =>
                                                changeStatus(
                                                    order.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option>
                                                Pending
                                            </option>

                                            <option>
                                                Processing
                                            </option>

                                            <option>
                                                Shipped
                                            </option>

                                            <option>
                                                Delivered
                                            </option>

                                            <option>
                                                Cancelled
                                            </option>

                                        </select>

                                    </td>

                                    <td>
                                        {
                                            order.created_at
                                        }
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            )}

        </div>
    );
}

export default AdminOrders;