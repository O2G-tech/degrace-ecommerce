import {
    useEffect,
    useState
} from "react";

import API from "../../services/api";

import {
   
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/categoryService";

function AdminCategories() {

 

    const [categories, setCategories] =
        useState([]);

    const [name, setName] =
        useState("");

    const [parentId, setParentId] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

       

   

    // const loadCategories = async () => {

    //     try {

    //         setLoading(true);

    //         const result =
    //             await getAdminCategories();

    //         if (!result.success) {

    //             setError(
    //                 result.message
    //             );

    //             return;
    //         }

    //         setCategories(
    //             result.data
    //         );

    //     } catch (error) {

    //         console.error(error);

    //         setError(
    //             "Failed to load categories"
    //         );

    //     } finally {

    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {

    //     loadCategories();

    // }, []);

      

    useEffect(() => {

        const loadCategories = async () => {

            try {
          

                const response =
                    await API.get(
                        "/categories/admin_get.php"
                    );

                if (
                    response.data.success
                ) {

                    setCategories(
                        response.data.data
                    );
                }

            } catch (error) {

                console.error(error);
            }
        };

        loadCategories();

          const handleSubmit = async (e) => {

        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {

            let result;

            if (editingId) {

                result =
                    await updateCategory({
                        id: editingId,
                        name,
                        parent_id:
                            parentId || null
                    });

            } else {

                result =
                    await createCategory({
                        name,
                        parent_id:
                            parentId || null
                    });
            }

            if (!result.success) {

                alert(
                    result.message
                );

                return;
            }

            setName("");
            setParentId("");
            setEditingId(null);

         loadCategories()

        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong"
            );
        }
    };

       const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this category?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            const response =
                await API.post(
                    "/categories/delete.php",
                    {
                        id
                    }
                );


            if (response.data.success) {

                alert(
                    "Category deleted successfully"
                );

                loadCategories();

            } else {

                alert(
                    response.data.message ||
                    "Failed to delete category"
                );

            }

        } catch (err) {

            console.error(
                "DELETE CATEGORY ERROR:",
                err
            );

            alert(
                "Something went wrong while deleting category"
            );

        }

    };

    }, []);

  

    const handleEdit = (category) => {

        setEditingId(
            category.id
        );

        setName(
            category.name
        );

        setParentId(
            category.parent_id || ""
        );
    };

    // const handleDelete = async (id) => {

    //     if (
    //         !window.confirm(
    //             "Delete this category?"
    //         )
    //     ) {
    //         return;
    //     }

    //     try {

    //         const result =
    //             await deleteCategory(id);

    //         if (!result.success) {

    //             alert(
    //                 result.message
    //             );

    //             return;
    //         }

    //         loadCategories();

    //     } catch (error) {

    //         console.error(error);

    //         alert(
    //             "Failed to delete category"
    //         );
    //     }
    // };

      const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this category?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            const response =
                await API.post(
                    "/categories/delete.php",
                    {
                        id
                    }
                );


            if (response.data.success) {

                alert(
                    "Category deleted successfully"
                );

                loadCategories();

            } else {

                alert(
                    response.data.message ||
                    "Failed to delete category"
                );

            }

        } catch (err) {

            console.error(
                "DELETE CATEGORY ERROR:",
                err
            );

            alert(
                "Something went wrong while deleting category"
            );

        }

    };

    const cancelEdit = () => {

        setEditingId(null);
        setName("");
        setParentId("");
    };

    return (

        <div>

            <h1>
                Categories
            </h1>

            <div className="admin-form-card">

                <h2>
                    {editingId
                        ? "Edit Category"
                        : "Add Category"
                    }
                </h2>

                <form
                    onSubmit={handleSubmit}
                >

                    <label>
                        Category Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }
                        placeholder="e.g. Blenders"
                        required
                    />

                    <label>
                        Parent Category
                    </label>

                    <select
                        value={parentId}
                        onChange={(e) =>
                            setParentId(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            No Parent Category
                        </option>

                        {categories
                            .filter(
                                (category) =>
                                    category.id !==
                                    editingId
                            )
                            .map(
                                (category) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}

                    </select>

                    <button type="submit">

                        {editingId
                            ? "Update Category"
                            : "Save Category"
                        }

                    </button>

                    {editingId && (

                        <button
                            type="button"
                            onClick={
                                cancelEdit
                            }
                        >
                            Cancel
                        </button>

                    )}

                </form>

            </div>

            <div className="admin-table-container">

               

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Parent
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {categories.map(
                                (category) => (

                                    <tr
                                        key={
                                            category.id
                                        }
                                    >

                                        <td>
                                            {
                                                category.id
                                            }
                                        </td>

                                        <td>
                                            {
                                                category.name
                                            }
                                        </td>

                                        <td>
                                            {category.parent_id
                                                ? "Subcategory"
                                                : "Category"
                                            }
                                        </td>

                                        <td>
                                            {
                                                category.parent_name ||
                                                "None"
                                            }
                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    handleEdit(
                                                        category
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        category.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                

            </div>

        </div>
    );
}

export default AdminCategories;