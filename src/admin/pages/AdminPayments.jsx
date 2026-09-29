import {
    useEffect,
    useState
} from "react";

import API from "../../services/api";

function AdminPayments() {

    const [payments, setPayments] =
        useState([]);

    useEffect(() => {

        const loadPayments = async () => {

            try {

                const response =
                    await API.get(
                        "/payments/get.php"
                    );

                if (
                    response.data.success
                ) {

                    setPayments(
                        response.data.data
                    );
                }

            } catch (error) {

                console.error(error);
            }
        };

        loadPayments();

    }, []);

    return (

        <div>

            <h1>
                Payments
            </h1>

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
                            Amount
                        </th>

                        <th>
                            Method
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {payments.map(
                        (payment) => (

                            <tr
                                key={
                                    payment.id
                                }
                            >

                                <td>
                                    {
                                        payment.order_number
                                    }
                                </td>

                                <td>
                                    {
                                        payment.full_name
                                    }
                                </td>

                                <td>
                                    ₦
                                    {Number(
                                        payment.amount
                                    ).toLocaleString()}
                                </td>

                                <td>
                                    {
                                        payment.payment_method
                                    }
                                </td>

                                <td>
                                    {
                                        payment.status
                                    }
                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>
    );
}

export default AdminPayments;