// import { useEffect, useState } from "react";

// import productService from "../services/productService";

// function ProductTest() {

//     const [products, setProducts] = useState([]);

//     const [loading, setLoading] = useState(true);

//     const [error, setError] = useState("");

//     useEffect(() => {

//         const loadProducts = async () => {

//             try {

//                 const result =
//                     await productService.getProducts({
//                         page: 1,
//                         limit: 12,
//                         search: "",
//                         category_id: "",
//                         sort: "latest"
//                     });

//                 console.log(
//                     "PRODUCT API RESPONSE:",
//                     result
//                 );

//                 if (result.success) {

//                     setProducts(
//                         result.data.products
//                     );

//                 } else {

//                     setError(result.message);

//                 }

//             } catch (err) {

//                 console.error(
//                     "PRODUCT API ERROR:",
//                     err
//                 );

//                 setError(
//                     "Failed to load products"
//                 );

//             } finally {

//                 setLoading(false);
//             }
//         };

//         loadProducts();

//     }, []);

//     if (loading) {

//         return <h2>Loading products...</h2>;
//     }

//     if (error) {

//         return <h2>{error}</h2>;
//     }

//     return (

//         <div>

//             <h1>Products</h1>

//             {products.map((product) => (

//                 <div key={product.id}>

//                     <h3>
//                         {product.name}
//                     </h3>

//                     <p>
//                         ₦{Number(
//                             product.price
//                         ).toLocaleString()}
//                     </p>

//                     <p>
//                         Stock: {product.stock}
//                     </p>

//                 </div>

//             ))}

//         </div>
//     );
// }

// export default ProductTest;