
import { useEffect, useState } from "react";

import API, { getImageUrl } from "../../services/api";
import ProductForm from "../../admin/components/ProductForm";

function AdminProducts() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Controls whether the product form is displayed
    const [showForm, setShowForm] = useState(false);

    // Product currently being edited
    const [editingProduct, setEditingProduct] =
        useState(null);


    // Load products
    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get(
                "/products/get.php",
                {
                    params: {
                        limit: 100
                    }
                }
            );

            if (response.data.success) {

                setProducts(
                    response.data.data?.products || []
                );

            } else {

                setError(
                    response.data.message ||
                    "Failed to load products"
                );

            }

        } catch (err) {

            console.error(
                "PRODUCT LOAD ERROR:",
                err
            );

            setError(
                "Failed to load products"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadProducts();

    }, []);


    // Open Add Product form
    const handleAddProduct = () => {

        setEditingProduct(null);

        setShowForm(true);

    };


    // Open Edit Product form
    const handleEditProduct = (product) => {

        setEditingProduct(product);

        setShowForm(true);

    };


    // Form successfully saved
    const handleFormSuccess = () => {

        setShowForm(false);

        setEditingProduct(null);

        loadProducts();

    };


    // Cancel form
    const handleCancel = () => {

        setShowForm(false);

        setEditingProduct(null);

    };


    // Delete product
    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            const response =
                await API.post(
                    "/products/delete.php",
                    {
                        id
                    }
                );


            if (response.data.success) {

                alert(
                    "Product deleted successfully"
                );

                loadProducts();

            } else {

                alert(
                    response.data.message ||
                    "Failed to delete product"
                );

            }

        } catch (err) {

            console.error(
                "DELETE PRODUCT ERROR:",
                err
            );

            alert(
                "Something went wrong while deleting the product"
            );

        }

    };


    return (

        <div className="admin-page">

            {/* PAGE HEADER */}

            <div className="admin-page-header">

                <div>

                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage your store products
                    </p>

                </div>


                {!showForm && (

                    <button
                        type="button"
                        onClick={handleAddProduct}
                    >
                        Add Product
                    </button>

                )}

            </div>


            {/* PRODUCT FORM */}

           {showForm && (
    <ProductForm
        product={editingProduct}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
    />
)}


            {/* PRODUCT LIST */}

            {!showForm && (

                <>

                    {loading && (

                        <p>
                            Loading products...
                        </p>

                    )}


                    {error && (

                        <p className="error">
                            {error}
                        </p>

                    )}


                    {!loading &&
                        !error &&
                        products.length === 0 && (

                            <p>
                                No products found.
                            </p>

                        )}


                    {!loading &&
                        !error &&
                        products.length > 0 && (

                            <div className="admin-products">

                                {products.map(
                                    (product) => (

                                        <div
                                            className="admin-product-card"
                                            key={product.id}
                                        >

                                            {/* IMAGE */}

                                            <div className="admin-product-image">

                                                {product.image ? (

                                                    <img
                                                        src={getImageUrl("products", product.image)}
                                                        alt={product.name}
                                                    />

                                                ) : (

                                                    <div>
                                                        No Image
                                                    </div>

                                                )}

                                            </div>


                                            {/* DETAILS */}

                                            <div className="admin-product-info">

                                                <h3>
                                                    {product.name}
                                                </h3>


                                                <p>
                                                    Category:{" "}
                                                    {product.category_name ||
                                                        "Uncategorized"}
                                                </p>


                                                <p>
                                                    ₦
                                                    {Number(
                                                        product.price
                                                    ).toLocaleString()}
                                                </p>


                                                <p>
                                                    Stock:{" "}
                                                    {product.stock}
                                                </p>


                                                <p>
                                                    Status:{" "}
                                                    {product.status}
                                                </p>

                                            </div>


                                            {/* ACTIONS */}

                                            <div className="admin-product-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditProduct(product)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </>

            )}

        </div>

    );

}

export default AdminProducts;
