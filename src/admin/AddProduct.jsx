
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/admin/ProductForm";

function AddProduct() {

    const navigate = useNavigate();


    const handleSuccess = () => {

        // After successfully adding product,
        // go back to product list.

        setTimeout(() => {

            navigate("/admin/products");

        }, 1000);

    };


    return (

        <div className="admin-page">

            <ProductForm
                onSuccess={handleSuccess}
                onCancel={() =>
                    navigate("/admin/products")
                }
            />

        </div>

    );

}

export default AddProduct;
