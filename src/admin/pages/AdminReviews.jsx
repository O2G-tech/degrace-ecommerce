import {
    useEffect,
    useState
} from "react";

import {
    getAdminReviews,
    updateReviewStatus,
    deleteReview
} from "../../services/reviewService";

function AdminReviews() {

    const [reviews, setReviews] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReviews = async () => {

        try {

            setLoading(true);
            setError("");

            const result = await getAdminReviews();

            if (!result.success) {
                setError(result.message || "Failed to load reviews");
                return;
            }

            setReviews(result.data?.reviews || []);

        } catch (error) {

            console.error("ADMIN REVIEWS ERROR:", error);
            setError("Failed to load reviews");

        } finally {

            setLoading(false);

        }
    };

    const handleStatusChange = async (id, status) => {

        try {

            const result = await updateReviewStatus(id, status);

            if (!result.success) {
                alert(result.message || "Failed to update review");
                return;
            }

            await loadReviews();

        } catch (error) {

            console.error("REVIEW STATUS ERROR:", error);
            alert("Failed to update review");

        }
    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this review?")) {
            return;
        }

        try {

            const result = await deleteReview(id);

            if (!result.success) {
                alert(result.message || "Failed to delete review");
                return;
            }

            await loadReviews();

        } catch (error) {

            console.error("DELETE REVIEW ERROR:", error);
            alert("Failed to delete review");

        }
    };

    useEffect(() => {

        loadReviews();

    }, []);

    return (

        <div>

            <h1>
                Reviews
            </h1>

            <table>

                <thead>

                    <tr>

                        <th>
                            Customer
                        </th>

                        <th>
                            Product
                        </th>

                        <th>
                            Rating
                        </th>

                        <th>
                            Review
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {!loading && !error && reviews.map(
                        (review) => (

                            <tr
                                key={
                                    review.id
                                }
                            >

                                <td>
                                    {
                                        review.customer_name
                                    }
                                </td>

                                <td>
                                    {
                                        review.product_name
                                    }
                                </td>

                                <td>
                                    ⭐
                                    {
                                        review.rating
                                    }
                                </td>

                                <td>
                                    {
                                        review.comment
                                    }
                                </td>

                                <td>
                                    {review.status}
                                </td>

                                <td>
                                    {review.status !== "approved" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleStatusChange(
                                                    review.id,
                                                    "approved"
                                                )
                                            }
                                        >
                                            Approve
                                        </button>
                                    )}

                                    {review.status !== "rejected" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleStatusChange(
                                                    review.id,
                                                    "rejected"
                                                )
                                            }
                                        >
                                            Reject
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(review.id)
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

            {loading && <p>Loading reviews...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && reviews.length === 0 && (
                <p>No reviews found.</p>
            )}

        </div>
    );
}

export default AdminReviews;