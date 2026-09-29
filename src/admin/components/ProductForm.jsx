
import { useEffect, useState } from "react";
import API from "../../services/api";
import ImageUpload from "./ImageUpload";

function ProductForm({
    product = null,
    onSuccess,
    onCancel
}) {

    // ============================================================
    // CATEGORIES
    // ============================================================

    const [categories, setCategories] = useState([]);

    const [parentCategory, setParentCategory] = useState("");

    const [subcategory, setSubcategory] = useState("");

    const [childCategory, setChildCategory] = useState("");


    // ============================================================
    // PRODUCT FORM DATA
    // ============================================================

    const [formData, setFormData] = useState({
        category_id: "",
        name: "",
        slug: "",
        description: "",
        price: "",
        old_price: "",
        stock: "",
        sku: "",
        status: "active"
    });


    // ============================================================
    // IMAGE
    // ============================================================

    const [image, setImage] = useState(null);


    // ============================================================
    // UI STATE
    // ============================================================

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ============================================================
    // LOAD ALL CATEGORIES
    // ============================================================

    useEffect(() => {

        const loadCategories = async () => {

            try {

                setError("");

                const response = await API.get(
                    "/categories/get.php"
                );

                console.log(
                    "CATEGORIES:",
                    response.data
                );

                if (response.data.success) {

                    setCategories(
                        response.data.data || []
                    );

                } else {

                    setError(
                        response.data.message ||
                        "Failed to load categories"
                    );

                }

            } catch (err) {

                console.error(
                    "LOAD CATEGORIES ERROR:",
                    err
                );

                setError(
                    "Failed to load categories"
                );

            }

        };

        loadCategories();

    }, []);


    // ============================================================
    // FIND CATEGORY
    // ============================================================

    const findCategory = (id) => {

        return categories.find(
            category =>
                Number(category.id) === Number(id)
        );

    };


    // ============================================================
    // GET CHILDREN OF A CATEGORY
    // ============================================================

    const getChildren = (parentId) => {

        if (!parentId) {
            return [];
        }

        return categories.filter(
            category =>
                Number(category.parent_id) ===
                Number(parentId)
        );

    };


    // ============================================================
    // TOP LEVEL CATEGORIES
    // ============================================================

    const parentCategories = categories.filter(
        category =>
            category.parent_id === null ||
            category.parent_id === undefined ||
            Number(category.parent_id) === 0
    );


    // ============================================================
    // CURRENT SUBCATEGORIES
    // ============================================================

    const subcategories =
        getChildren(parentCategory);


    // ============================================================
    // CURRENT CHILD CATEGORIES
    // ============================================================

    const childCategories =
        getChildren(subcategory);


    // ============================================================
    // LOAD PRODUCT INTO FORM WHEN EDITING
    // ============================================================

    useEffect(() => {

        if (!product || categories.length === 0) {
            return;
        }

        const productCategoryId =
            product.category_id ??
            product.category ??
            product.categoryId ??
            "";

        console.log(
            "EDITING PRODUCT:",
            product
        );


        const selectedCategory =
            findCategory(productCategoryId);


        if (!selectedCategory) {

            console.warn(
                "PRODUCT CATEGORY NOT FOUND:",
                productCategoryId
            );

            setFormData({
                category_id: productCategoryId,
                name: product.name || "",
                slug: product.slug || "",
                description: product.description || "",
                price: product.price || "",
                old_price: product.old_price || "",
                stock: product.stock || "",
                sku: product.sku || "",
                status: product.status || "active"
            });

            return;
        }


        // ========================================================
        // DETERMINE CATEGORY LEVEL
        // ========================================================

        const selectedParentId =
            selectedCategory.parent_id;


        // --------------------------------------------------------
        // PRODUCT BELONGS DIRECTLY TO TOP LEVEL
        // --------------------------------------------------------

        if (
            selectedParentId === null ||
            selectedParentId === undefined ||
            Number(selectedParentId) === 0
        ) {

            setParentCategory(
                String(selectedCategory.id)
            );

            setSubcategory("");

            setChildCategory("");

        }

        // --------------------------------------------------------
        // PRODUCT CATEGORY HAS A PARENT
        // --------------------------------------------------------

        else {

            const parent =
                findCategory(selectedParentId);


            if (parent) {

                // =================================================
                // PARENT IS TOP LEVEL
                // Product belongs to subcategory
                // =================================================

                if (
                    parent.parent_id === null ||
                    parent.parent_id === undefined ||
                    Number(parent.parent_id) === 0
                ) {

                    setParentCategory(
                        String(parent.id)
                    );

                    setSubcategory(
                        String(selectedCategory.id)
                    );

                    setChildCategory("");

                }

                // =================================================
                // PRODUCT BELONGS TO CHILD CATEGORY
                // =================================================

                else {

                    setParentCategory(
                        String(parent.parent_id)
                    );

                    setSubcategory(
                        String(parent.id)
                    );

                    setChildCategory(
                        String(selectedCategory.id)
                    );

                }

            }

        }


        // ========================================================
        // FILL PRODUCT FIELDS
        // ========================================================

        setFormData({
            category_id: productCategoryId,
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            price: product.price || "",
            old_price: product.old_price || "",
            stock: product.stock || "",
            sku: product.sku || "",
            status: product.status || "active"
        });

    }, [product, categories]);


    // ============================================================
    // PARENT CATEGORY CHANGE
    // ============================================================

    const handleParentChange = (e) => {

        const value = e.target.value;

        setParentCategory(value);

        setSubcategory("");

        setChildCategory("");


        setFormData(prev => ({
            ...prev,
            category_id: value
        }));

    };


    // ============================================================
    // SUBCATEGORY CHANGE
    // ============================================================

    const handleSubcategoryChange = (e) => {

        const value = e.target.value;

        setSubcategory(value);

        setChildCategory("");


        /*
        If there is no child category,
        the product can belong directly
        to this subcategory.
        */

        setFormData(prev => ({
            ...prev,
            category_id: value
        }));

    };


    // ============================================================
    // CHILD CATEGORY CHANGE
    // ============================================================

    const handleChildCategoryChange = (e) => {

        const value = e.target.value;

        setChildCategory(value);


        /*
        IMPORTANT:
        The CHILD category becomes the
        product's category_id.
        */

        setFormData(prev => ({
            ...prev,
            category_id: value
        }));


        console.log(
            "FINAL PRODUCT CATEGORY ID:",
            value
        );

    };


    // ============================================================
    // PRODUCT NAME
    // ============================================================

    const handleNameChange = (e) => {

        const name = e.target.value;

        const slug = name
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );


        setFormData(prev => ({
            ...prev,
            name,
            slug
        }));

    };


    // ============================================================
    // OTHER INPUTS
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };


    // ============================================================
    // RESET FORM
    // ============================================================

    const resetForm = () => {

        setFormData({
            category_id: "",
            name: "",
            slug: "",
            description: "",
            price: "",
            old_price: "",
            stock: "",
            sku: "",
            status: "active"
        });

        setParentCategory("");

        setSubcategory("");

        setChildCategory("");

        setImage(null);

    };


    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        setSuccess("");


        try {

            // ====================================================
            // VALIDATE CATEGORY
            // ====================================================

            if (!formData.category_id) {

                setError(
                    "Please select a category"
                );

                setLoading(false);

                return;
            }


            // ====================================================
            // CREATE FORMDATA
            // ====================================================

            const data = new FormData();


            // ----------------------------------------------------
            // PRODUCT ID FOR EDIT
            // ----------------------------------------------------

            if (product) {

                data.append(
                    "id",
                    product.id
                );

            }


            // ----------------------------------------------------
            // CATEGORY
            // ----------------------------------------------------

            data.append(
                "category_id",
                formData.category_id
            );


            // ----------------------------------------------------
            // PRODUCT INFORMATION
            // ----------------------------------------------------

            data.append(
                "name",
                formData.name
            );

            data.append(
                "slug",
                formData.slug
            );

            data.append(
                "description",
                formData.description
            );

            data.append(
                "price",
                formData.price
            );

            data.append(
                "old_price",
                formData.old_price
            );

            data.append(
                "stock",
                formData.stock
            );

            data.append(
                "sku",
                formData.sku
            );

            data.append(
                "status",
                formData.status
            );


            // ----------------------------------------------------
            // IMAGE
            // ----------------------------------------------------

            if (image) {

                data.append(
                    "image",
                    image
                );

            }


            // ====================================================
            // DEBUG
            // ====================================================

            console.log(
                "========== PRODUCT SUBMISSION =========="
            );

            for (
                const [key, value]
                of data.entries()
            ) {

                console.log(
                    key,
                    ":",
                    value
                );

            }


            // ====================================================
            // CREATE OR UPDATE
            // ====================================================

            let response;


            if (product) {

                console.log(
                    "UPDATING PRODUCT:",
                    product.id
                );


                response = await API.post(
                    "/products/update.php",
                    data
                );

            } else {

                console.log(
                    "CREATING PRODUCT"
                );


                response = await API.post(
                    "/products/create.php",
                    data
                );

            }


            console.log(
                "SERVER RESPONSE:",
                response.data
            );


            // ====================================================
            // SUCCESS
            // ====================================================

            if (response.data.success) {

                setSuccess(
                    product
                        ? "Product updated successfully!"
                        : "Product added successfully!"
                );


                /*
                Tell AdminProducts to reload
                its product list.
                */

                if (onSuccess) {

                    await onSuccess(
                        response.data
                    );

                }


                /*
                Reset only when creating.
                When editing, keep the updated
                product information visible.
                */

                if (!product) {

                    resetForm();

                }

            } else {

                setError(
                    response.data.message ||
                    "Failed to save product"
                );

            }

        } catch (err) {

            console.error(
                "PRODUCT SAVE ERROR:",
                err
            );

            console.error(
                "SERVER RESPONSE:",
                err.response?.data
            );


            setError(
                err.response?.data?.message ||
                "Something went wrong while saving the product"
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <form
            className="admin-form"
            onSubmit={handleSubmit}
        >

            <h2>
                {product
                    ? "Edit Product"
                    : "Add Product"}
            </h2>


            {/* ERROR */}

            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div className="success-message">
                    {success}
                </div>

            )}


            {/* ====================================================
                PARENT CATEGORY
            ==================================================== */}

            <div className="form-group">

                <label>
                    Parent Category *
                </label>

                <select
                    value={parentCategory}
                    onChange={handleParentChange}
                    required
                >

                    <option value="">
                        Select Parent Category
                    </option>


                    {parentCategories.map(
                        category => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* ====================================================
                SUBCATEGORY
            ==================================================== */}

            {parentCategory && (

                <div className="form-group">

                    <label>
                        Subcategory
                    </label>

                    <select
                        value={subcategory}
                        onChange={
                            handleSubcategoryChange
                        }
                    >

                        <option value="">
                            Select Subcategory
                        </option>


                        {subcategories.map(
                            category => (

                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>

                            )
                        )}

                    </select>

                </div>

            )}


            {/* ====================================================
                CHILD CATEGORY
            ==================================================== */}

            {subcategory &&
                childCategories.length > 0 && (

                    <div className="form-group">

                        <label>
                            Child Category
                        </label>

                        <select
                            value={childCategory}
                            onChange={
                                handleChildCategoryChange
                            }
                        >

                            <option value="">
                                Select Child Category
                            </option>


                            {childCategories.map(
                                category => (

                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                )}


            {/* ====================================================
                PRODUCT NAME
            ==================================================== */}

            <div className="form-group">

                <label>
                    Product Name *
                </label>

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Silver Crest Blender"
                    required
                />

            </div>


            {/* ====================================================
                SLUG
            ==================================================== */}

            <div className="form-group">

                <label>
                    Slug *
                </label>

                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="silver-crest-blender"
                    required
                />

            </div>


            {/* ====================================================
                DESCRIPTION
            ==================================================== */}

            <div className="form-group">

                <label>
                    Description
                </label>

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows="5"
                />

            </div>


            {/* ====================================================
                PRICE
            ==================================================== */}

            <div className="form-row">

                <div className="form-group">

                    <label>
                        Price (₦) *
                    </label>

                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        required
                    />

                </div>


                <div className="form-group">

                    <label>
                        Old Price (₦)
                    </label>

                    <input
                        type="number"
                        name="old_price"
                        value={formData.old_price}
                        onChange={handleChange}
                        min="0"
                    />

                </div>

            </div>


            {/* ====================================================
                STOCK
            ==================================================== */}

            <div className="form-row">

                <div className="form-group">

                    <label>
                        Stock *
                    </label>

                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        required
                    />

                </div>


                <div className="form-group">

                    <label>
                        SKU
                    </label>

                    <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="BLENDER-001"
                    />

                </div>

            </div>


            {/* ====================================================
                STATUS
            ==================================================== */}

            <div className="form-group">

                <label>
                    Status
                </label>

                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >

                    <option value="active">
                        Active
                    </option>

                    <option value="inactive">
                        Inactive
                    </option>

                </select>

            </div>


            {/* ====================================================
                IMAGE
            ==================================================== */}

            <ImageUpload
                image={image}
                setImage={setImage}
                existingImage={product?.image}
                folder="products"
                label="Product Image"
            />


            {/* ====================================================
                BUTTONS
            ==================================================== */}

            <div className="form-buttons">

                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading
                        ? "Saving..."
                        : product
                            ? "Update Product"
                            : "Add Product"}

                </button>


                {onCancel && (

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                )}

            </div>

        </form>

    );

}

export default ProductForm;
