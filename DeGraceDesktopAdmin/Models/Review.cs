using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class Review
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("product_id")]
        public int ProductId { get; set; }

        [JsonProperty("user_id")]
        public int UserId { get; set; }

        [JsonProperty("product_name")]
        public string? ProductName { get; set; }

        [JsonProperty("product_image")]
        public string? ProductImage { get; set; }

        [JsonProperty("customer_name")]
        public string? CustomerName { get; set; }

        [JsonProperty("customer_email")]
        public string? CustomerEmail { get; set; }

        [JsonProperty("rating")]
        public int Rating { get; set; }

        [JsonProperty("comment")]
        public string Comment { get; set; } = string.Empty;

        [JsonProperty("status")]
        public string Status { get; set; } = "pending";

        [JsonProperty("admin_reply")]
        public string? AdminReply { get; set; }

        [JsonProperty("created_at")]
        public string? CreatedAt { get; set; }

        public string StarRating => new string('★', Rating) + new string('☆', Math.Max(0, 5 - Rating));
        public bool IsPending => string.Equals(Status, "pending", StringComparison.OrdinalIgnoreCase);
        public bool IsApproved => string.Equals(Status, "approved", StringComparison.OrdinalIgnoreCase);
        public bool IsRejected => string.Equals(Status, "rejected", StringComparison.OrdinalIgnoreCase);
    }

    public class ReviewsResponse
    {
        [JsonProperty("reviews")]
        public List<Review> Reviews { get; set; } = new();

        [JsonProperty("count")]
        public int Count { get; set; }
    }
}
