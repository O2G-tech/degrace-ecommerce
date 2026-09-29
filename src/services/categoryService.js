import API from "./api";

export const getCategories = async () => {

    const response =
        await API.get(
            "/categories/get.php"
        );

    return response.data;
};

export const getSubcategories = async (
    parentId
) => {

    const response =
        await API.get(
            `/categories/subcategories.php?parent_id=${parentId}`
        );

    return response.data;
};

export const getAdminCategories = async () => {

    const response =
        await API.get(
            "/categories/admin_get.php"
        );

    return response.data;
};

export const createCategory = async (
    category
) => {

    const response =
        await API.post(
            "/categories/create.php",
            {
                name: category.name,
                parent_id: category.parent_id ?? null
            }
        );

    return response.data;
};

export const updateCategory = async (
    category
) => {

    const response =
        await API.put(
            "/categories/update.php",
            {
                id: category.id,
                name: category.name,
                parent_id: category.parent_id ?? null
            }
        );

    return response.data;
};

export const deleteCategory = async (
    id
) => {

    const response =
        await API.delete(
            "/categories/delete.php",
            {
                data: { id }
            }
        );

    return response.data;
};