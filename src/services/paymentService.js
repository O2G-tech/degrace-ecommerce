import API from "./api";


/*
|--------------------------------------------------------------------------
| Initialize Payment
|--------------------------------------------------------------------------
*/

export const initializePayment = async (
    orderId,
    email
) => {

    try {

        const response = await API.post(
            "/payments/initialize.php",
            {
                order_id: Number(orderId),
                email: email
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "INITIALIZE PAYMENT ERROR:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
*/

export const verifyPayment = async (
    reference
) => {

    try {

        const response = await API.post(
            "/payments/verify.php",
            {
                reference
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error
        );

        throw error;
    }
};