import {
    useLocation,
    useNavigate
} from "react-router-dom";


function PaymentSuccess() {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const payment =
        location.state?.payment;


    return (

        <div className="payment-success">

            <div className="success-card">

                <h1>
                    Payment Successful 🎉
                </h1>


                <p>
                    Your payment has been
                    successfully verified.
                </p>


                {payment && (

                    <div>

                        <p>
                            <strong>
                                Reference:
                            </strong>{" "}
                            {payment.reference}
                        </p>


                        <p>
                            <strong>
                                Transaction ID:
                            </strong>{" "}
                            {payment.transaction_id}
                        </p>

                    </div>

                )}


                <button
                    onClick={() =>
                        navigate("/orders")
                    }
                >
                    View My Orders
                </button>

            </div>

        </div>

    );

}


export default PaymentSuccess;