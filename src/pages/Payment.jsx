import {
    useEffect,
    useState
} from "react";

import {
    useSearchParams,
    useNavigate
} from "react-router-dom";

import {
    verifyPayment
} from "../services/paymentService";


function Payment() {

    const [searchParams] =
        useSearchParams();

    const navigate =
        useNavigate();


    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const verify = async () => {

            const reference =
                searchParams.get(
                    "reference"
                );


            if (!reference) {

                setError(
                    "Payment reference is missing."
                );

                setLoading(false);

                return;
            }


            try {

                const result =
                    await verifyPayment(
                        reference
                    );


                console.log(
                    "PAYMENT VERIFICATION:",
                    result
                );


                if (
                    result.success
                ) {

                    navigate(
                        "/payment-success",
                        {
                            replace: true,

                            state: {
                                payment:
                                    result.data
                            }
                        }
                    );

                } else {

                    setError(
                        result.message ||
                        "Payment verification failed."
                    );

                }

            } catch (err) {

                console.error(
                    "PAYMENT ERROR:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    "Unable to verify payment."
                );

            } finally {

                setLoading(false);

            }

        };


        verify();

    }, [
        searchParams,
        navigate
    ]);


    if (loading) {

        return (

            <div className="payment-page">

                <h2>
                    Verifying payment...
                </h2>

                <p>
                    Please wait while we confirm
                    your transaction.
                </p>

            </div>

        );

    }


    return (

        <div className="payment-page">

            <h2>
                Payment Verification
            </h2>


            {error && (

                <div className="error-message">

                    {error}

                    <br />

                    <button
                        onClick={() =>
                            navigate("/orders")
                        }
                    >
                        Go to My Orders
                    </button>

                </div>

            )}

        </div>

    );

}


export default Payment;