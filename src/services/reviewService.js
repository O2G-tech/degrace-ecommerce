import API from "./api";


// Get approved reviews for a product
export const getProductReviews = async (productId) => {

    const response = await API.get(
        "/reviews/get.php",
        {
            params: {
                product_id: productId
            }
        }
    );

    return response.data;
};



// Customer creates review
export const createReview = async (
    productId,
    rating,
    comment
) => {

    const response = await API.post(
        "/reviews/create.php",
        {
            product_id: productId,
            rating: rating,
            comment: comment
        }
    );

    return response.data;
};


// Admin gets all reviews
export const getAdminReviews = async () => {

    const response = await API.get(
        "/reviews/admin_get.php"
    );

    return response.data;
};


// Admin approves/rejects review
export const updateReviewStatus = async (
    id,
    status
) => {

    const response = await API.post(
        "/reviews/update_status.php",
        {
            id: id,
            status: status
        }
    );

    return response.data;
};


// Admin deletes review
export const deleteReview = async (id) => {

    const response = await API.post(
        "/reviews/delete.php",
        {
            id: id
        }
    );

    return response.data;
};

 