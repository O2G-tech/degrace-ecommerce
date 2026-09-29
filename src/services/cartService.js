 import API from "./api";

/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
| Gets all cart items belonging to the currently logged-in user.
*/

export const getCart = async () => {
    try {
        const response = await API.get(
            "/cart/get.php"
        );

        return response.data;

    } catch (error) {

        console.error(
            "GET CART ERROR:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| ADD TO CART
|--------------------------------------------------------------------------
| Adds a product to the logged-in user's cart.
*/

export const addToCart = async (
    productId,
    quantity = 1
) => {

    try {

        const response = await API.post(
            "/cart/add.php",
            {
                product_id: Number(productId),
                quantity: Number(quantity)
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
| IMPORTANT:
| cartItemId must be the ID from the cart_items table,
| NOT the product ID.
*/

export const updateCartItem = async (
    cartItemId,
    quantity
) => {

    try {

        const response = await API.post(
            "/cart/update.php",
            {
                cart_item_id: Number(cartItemId),
                quantity: Number(quantity)
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "UPDATE CART ITEM ERROR:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| REMOVE FROM CART
|--------------------------------------------------------------------------
| IMPORTANT:
| cartItemId must be the ID from cart_items.
*/

export const removeFromCart = async (
    cartItemId
) => {

    try {

        const response = await API.post(
            "/cart/delete.php",
            {
                cart_item_id: Number(cartItemId)
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "REMOVE CART ITEM ERROR:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| ALIAS FOR REMOVE
|--------------------------------------------------------------------------
| This prevents the:
|
| "does not provide an export named handleRemove"
|
| error if your Cart.jsx imports handleRemove.
*/

export const handleRemove = async (
    cartItemId
) => {

    return await removeFromCart(
        cartItemId
    );
};