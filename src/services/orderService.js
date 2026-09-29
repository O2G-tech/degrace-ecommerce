
import API from "./api";


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrder = async (
    checkoutData
) => {

    const response =
        await API.post(
            "/orders/create.php",
            checkoutData
        );

    return response.data;

};


/*
|--------------------------------------------------------------------------
| Get Customer Orders
|--------------------------------------------------------------------------
*/

export const getOrders = async () => {

    const response =
        await API.get(
            "/orders/get.php"
        );

    return response.data;

};


/*
|--------------------------------------------------------------------------
| Get Single Order
|--------------------------------------------------------------------------
*/

export const getOrder = async (
    id
) => {

    const response =
        await API.get(
            `/orders/single.php?id=${id}`
        );

    return response.data;

};


 

export const getAdminOrders = async () => {

    const response =
        await API.get(
            "/orders/admin_get.php"
        );

    return response.data;
};

export const updateOrderStatus = async (
    id,
    status
) => {

    const response =
        await API.put(
            "/orders/update-status.php",
            {
                id,
                status
            }
        );

    return response.data;
};