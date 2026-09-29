
import { useEffect, useState } from "react";
import API from "../../services/api";
import ImageUpload from "./ImageUpload";

function CategoryForm({
    category = null,
    onSuccess,
    onCancel
}) {

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        parent_id: ""
    });

    const [image, setImage] = useState(null);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // Load categories for parent selection
    useEffect(() => {

        loadCategories();

    }, []);


    // Fill form when editing
    useEffect(() => {

        if (category) {

            setFormData({
                name: category.name || "",
                slug: category.slug || "",
                parent_id: category.parent_id || ""
            });

        }

    }, [category]);


    const loadCategories = async () => {

        try {

            const response =
                await API.get(
                    "/categories/get.php"
                );

            if (response.data.success) {

                setCategories(
                    response.data.data || []
                );

            }

        } catch (err) {

            console.error(
                "CATEGORY LOAD ERROR:",
                err
            );

        }

    };


    // Handle category name
    const handleNameChange = (e) => {

        const name = e.target.value;

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");


        setFormData({
            ...formData,
            name,
            slug
        });

    };


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData({
            ...formData,
            [name]: value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");


        try {

            const data =
                new FormData();


            data.append(
                "name",
                formData.name
            );

            data.append(
                "slug",
                formData.slug
            );

            data.append(
                "parent_id",
                formData.parent_id
            );


            if (image) {

                data.append(
                    "image",
                    image
                );

            }


            let response;


            if (category) {

                data.append(
                    "id",
                    category.id
                );


                response =
                    await API.post(
                        "/categories/update.php",
                        data,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data"
                            }
                        }
                    );

            } else {

                response =
                    await API.post(
                        "/categories/create.php",
                        data,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data"
                            }
                        }
                    );

            }


            if (response.data.success) {

                setSuccess(
                    category
                        ? "Category updated successfully!"
                        : "Category created successfully!"
                );


                if (!category) {

                    setFormData({
                        name: "",
                        slug: "",
                        parent_id: ""
                    });

                    setImage(null);

                }


                if (onSuccess) {

                    onSuccess(
                        response.data
                    );

                }

            } else {

                setError(
                    response.data.message ||
                    "Failed to save category"
                );

            }

        } catch (err) {

            console.error(
                "CATEGORY SAVE ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Something went wrong while saving the category"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <form
            className="admin-form"
            onSubmit={handleSubmit}
        >

            <h2>
                {category
                    ? "Edit Category"
                    : "Add Category"}
            </h2>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}


            {/* Name */}

            <div className="form-group">

                <label>
                    Category Name *
                </label>

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Kitchen"
                    required
                />

            </div>


            {/* Slug */}

            <div className="form-group">

                <label>
                    Slug *
                </label>

                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="kitchen"
                    required
                />

            </div>


            {/* Parent */}

            <div className="form-group">

                <label>
                    Parent Category
                </label>

                <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                >

                    <option value="">
                        None - Main Category
                    </option>


                    {categories
                        .filter(
                            (item) =>
                                !category ||
                                item.id != category.id
                        )
                        .map((item) => (

                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>

                        ))}

                </select>

            </div>


            {/* Image */}

            <ImageUpload
                image={image}
                setImage={setImage}
                existingImage={
                    category?.image
                }
            />


            {/* Buttons */}

            <div className="form-buttons">

                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading
                        ? "Saving..."
                        : category
                            ? "Update Category"
                            : "Save Category"}

                </button>


                {onCancel && (

                    <button
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                )}

            </div>

        </form>

    );

}

export default CategoryForm;
