import API from "./api";

 export const getProducts = async ({ page = 1, limit = 12, search = "", sort = "latest", category_id = "" } = {}) => { const response = await API.get( "/products/get.php", { params: { page, limit, search, sort, category_id } } ); return response.data; };


export const getProduct = async (id) => {

    const response = await API.get(
        "/products/single.php",
        {
            params: {
                id: id
            }
        }
    );

    return response.data;
};

export const getAdminProducts = async () => {

    const response =
        await API.get(
            "/products/get.php"
        );

    return response.data;
};

export const createProduct = async (
    product
) => {

    const response =
        await API.post(
            "/products/create.php",
            product
        );

    return response.data;
};

export const updateProduct = async (
    product
) => {

    const response =
        await API.put(
            "/products/update.php",
            product
        );

    return response.data;
};

export const deleteProduct = async (
    id
) => {

    const response =
        await API.delete(
            "/products/delete.php",
            {
                data: { id }
            }
        );

    return response.data;
};