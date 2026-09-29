import { useEffect, useState } from "react";

import { getCategories } from "../services/categoryService";

function ApiTest() {

    const [categories, setCategories] = useState([]);

    const [message, setMessage] = useState("Loading...");

    useEffect(() => {

        async function loadCategories() {

            try {

                const result = await getCategories();

                console.log("API RESPONSE:", result);

                if (result.success) {

                    setCategories(result.data);

                    setMessage("");

                } else {

                    setMessage(result.message);
                }

            } catch (error) {

                console.error("API ERROR:", error);

                setMessage(
                    "Failed to connect to PHP API"
                );
            }
        }

        loadCategories();

    }, []);

    return (
        <div style={{ padding: "30px" }}>

            <h1>API Test</h1>

            <p>{message}</p>

            {categories.map((category) => (
                <div key={category.id}>
                    {category.name}
                </div>
            ))}

        </div>
    );
}

export default ApiTest;