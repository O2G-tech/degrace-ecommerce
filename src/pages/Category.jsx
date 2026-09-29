
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getSubcategories } from "../services/categoryService";
import { getProducts } from "../services/productService";

import ProductCard from "../components/ProductCards";
import { getImageUrl } from "../services/api";


function Category() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [subcategories, setSubcategories] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [categoryName, setCategoryName] =
        useState("");


    useEffect(() => {

        const loadCategory = async () => {

            try {

                setLoading(true);

                setError("");

                setSubcategories([]);

                setProducts([]);


                /*
                |--------------------------------------------------------------------------
                | Make sure we have a category ID
                |--------------------------------------------------------------------------
                */

                if (!id) {

                    setError(
                        "Category ID is missing"
                    );

                    return;
                }


                console.log(
                    "===================================="
                );

                console.log(
                    "CURRENT CATEGORY ID:",
                    id
                );


                /*
                |--------------------------------------------------------------------------
                | STEP 1
                | Check if this category has children
                |--------------------------------------------------------------------------
                */

                const categoryResponse =
                    await getSubcategories(id);


                console.log(
                    "SUBCATEGORY RESPONSE:",
                    categoryResponse
                );


                let children = [];


                if (
                    categoryResponse &&
                    categoryResponse.success &&
                    Array.isArray(categoryResponse.data)
                ) {

                    children =
                        categoryResponse.data;

                }


                /*
                |--------------------------------------------------------------------------
                | STEP 2
                | If children exist, show them
                |--------------------------------------------------------------------------
                */

                if (children.length > 0) {

                    console.log(
                        "SUBCATEGORIES FOUND:",
                        children
                    );


                    setSubcategories(
                        children
                    );


                    setLoading(false);

                    return;
                }


                /*
                |--------------------------------------------------------------------------
                | STEP 3
                | No children.
                |
                | This is a product/leaf category.
                |
                | Load products using THIS category ID.
                |--------------------------------------------------------------------------
                */

                console.log(
                    "NO SUBCATEGORIES"
                );

                console.log(
                    "LOADING PRODUCTS FOR CATEGORY:",
                    id
                );


                const productResponse =
                    await getProducts({

                        category_id: id,

                        page: 1,

                        limit: 100,

                        search: "",

                        sort: "latest"

                    });


                console.log(
                    "PRODUCT RESPONSE:",
                    productResponse
                );


                /*
                |--------------------------------------------------------------------------
                | STEP 4
                | Check product response
                |--------------------------------------------------------------------------
                */

                if (
                    !productResponse ||
                    !productResponse.success
                ) {

                    setError(
                        productResponse?.message ||
                        "Failed to load products"
                    );

                    return;
                }


                const productData =
                    productResponse.data;


                const loadedProducts =
                    productData?.products || [];


                console.log(
                    "PRODUCTS FOUND:",
                    loadedProducts
                );


                setProducts(
                    loadedProducts
                );


            } catch (err) {

                console.error(
                    "===================================="
                );

                console.error(
                    "CATEGORY ERROR:",
                    err
                );

                console.error(
                    "SERVER RESPONSE:",
                    err.response?.data
                );

                console.error(
                    "STATUS:",
                    err.response?.status
                );

                console.error(
                    "===================================="
                );


                setError(
                    "Failed to load category"
                );


            } finally {

                setLoading(false);

            }

        };


        loadCategory();

    }, [id]);


    /*
    |--------------------------------------------------------------------------
    | BACK BUTTON
    |--------------------------------------------------------------------------
    */

    const handleBack = () => {

        navigate(-1);

    };


    return (

        <>

            <Navbar />


            <main className="page-container">


                <button
                    onClick={handleBack}
                    className="back-button"
                >
                    ← Back
                </button>


                {/* ==========================================================
                    LOADING
                ========================================================== */}

                {loading && (

                    <p>
                        Loading...
                    </p>

                )}


                {/* ==========================================================
                    ERROR
                ========================================================== */}

                {!loading && error && (

                    <p className="error">
                        {error}
                    </p>

                )}


                {/* ==========================================================
                    SUBCATEGORIES
                ========================================================== */}

                {!loading &&
                    !error &&
                    subcategories.length > 0 && (

                        <>

                            <h1>
                                Categories
                            </h1>


                            <div className="categories">

                                {subcategories.map(
                                    (category) => (

                                        <Link
                                            key={
                                                category.id
                                            }
                                            to={
                                                `/category/${category.id}`
                                            }
                                            className="category-card"
                                        >

                                            <div className="category-image">

                                                {category.image ? (

                                                    <img
                                                        src={getImageUrl("categories", category.image)}
                                                        alt={
                                                            category.name
                                                        }
                                                    />

                                                ) : (

                                                    <div className="no-image">
                                                        🛍️
                                                    </div>

                                                )}

                                            </div>


                                            <h3>
                                                {
                                                    category.name
                                                }
                                            </h3>


                                        </Link>

                                    )
                                )}

                            </div>

                        </>

                    )}


                {/* ==========================================================
                    PRODUCTS
                ========================================================== */}

                {!loading &&
                    !error &&
                    subcategories.length === 0 &&
                    products.length > 0 && (

                        <>

                            <h1>
                                Products
                            </h1>


                            <div className="products-grid">

                                {products.map(
                                    (product) => (

                                        <ProductCard
                                            key={
                                                product.id
                                            }
                                            product={
                                                product
                                            }
                                        />

                                    )
                                )}

                            </div>

                        </>

                    )}


                {/* ==========================================================
                    NO PRODUCTS
                ========================================================== */}

                {!loading &&
                    !error &&
                    subcategories.length === 0 &&
                    products.length === 0 && (

                        <div>

                            <h1>
                                Products
                            </h1>


                            <p>
                                No products found in this category.
                            </p>

                        </div>

                    )}


            </main>


            <Footer />

        </>

    );

}


export default Category;
