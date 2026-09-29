import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { verifyPayment } from "../services/paymentService";

function PaymentCallback() {

    const [searchParams] =
        useSearchParams();

    const navigate =
        useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState(
            "Verifying your payment..."
        );


    useEffect(() => {

        const verify = async () => {

            try {

                const reference =
                    searchParams.get(
                        "reference"
                    );


                if (!reference) {

                    setMessage(
                        "Payment reference was not found."
                    );

                    setLoading(false);

                    return;

                }


                const result =
                    await verifyPayment(
                        reference
                    );


                if (
                    result.success
                ) {

                    setMessage(
                        "Payment successful! Your order has been confirmed."
                    );


                    setTimeout(() => {

                        navigate(
                            "/account"
                        );

                    }, 2500);

                } else {

                    setMessage(
                        result.message ||
                        "Payment verification failed."
                    );

                }

            } catch (error) {

                console.error(
                    "PAYMENT VERIFY ERROR:",
                    error
                );

                setMessage(
                    "Something went wrong while verifying your payment."
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


    return (

        <div className="payment-callback">

            <h1>
                Payment
            </h1>

            <p>
                {message}
            </p>

            {loading && (
                <p>
                    Please wait...
                </p>
            )}

        </div>

    );

}

export default PaymentCallback;