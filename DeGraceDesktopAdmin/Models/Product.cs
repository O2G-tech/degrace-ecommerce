using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class Product
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("category_id")]
        public int? CategoryId { get; set; }

        [JsonProperty("category_name")]
        public string? CategoryName { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonProperty("description")]
        public string? Description { get; set; }

        [JsonProperty("price")]
        public decimal Price { get; set; }

        [JsonProperty("stock")]
        public int Stock { get; set; }

        [JsonProperty("image")]
        public string? Image { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; } = "active";

        [JsonProperty("created_at")]
        public string? CreatedAt { get; set; }

        public string FormattedPrice => $"₦{Price:N2}";
        public bool IsActive => string.Equals(Status, "active", StringComparison.OrdinalIgnoreCase);
        public bool IsLowStock => Stock <= 5;
        public string ImageUrl => string.IsNullOrEmpty(Image) 
            ? "https://via.placeholder.com/150" 
            : (Image.StartsWith("http") ? Image : $"http://localhost/backend/uploads/products/{Image}");
    }
}
