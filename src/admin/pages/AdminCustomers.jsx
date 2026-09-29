import {
    useEffect,
    useState
} from "react";

import API from "../../services/api";

function AdminCustomers() {

    const [customers, setCustomers] =
        useState([]);

    useEffect(() => {

        const loadCustomers = async () => {

            try {

                const response =
                    await API.get(
                        "/customers/get.php"
                    );

                if (
                    response.data.success
                ) {

                    setCustomers(
                        response.data.data
                    );
                }

            } catch (error) {

                console.error(error);
            }
        };

        loadCustomers();

    }, []);

    return (

        <div>

            <h1>
                Customers
            </h1>

            <table>

                <thead>

                    <tr>

                        <th>
                            Name
                        </th>

                        <th>
                            Email
                        </th>

                        <th>
                            Phone
                        </th>

                        <th>
                            Orders
                        </th>

                        <th>
                            Total Spent
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {customers.map(
                        (customer) => (

                            <tr
                                key={
                                    customer.id
                                }
                            >

                                <td>
                                    {
                                        customer.name
                                    }
                                </td>

                                <td>
                                    {
                                        customer.email
                                    }
                                </td>

                                <td>
                                    {
                                        customer.phone
                                    }
                                </td>

                                <td>
                                    {
                                        customer.order_count
                                    }
                                </td>

                                <td>
                                    ₦
                                    {Number(
                                        customer.total_spent
                                    ).toLocaleString()}
                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>
    );
}

export default AdminCustomers;