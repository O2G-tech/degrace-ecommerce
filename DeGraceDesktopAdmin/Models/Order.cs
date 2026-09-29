using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class Order
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("order_number")]
        public string OrderNumber { get; set; } = string.Empty;

        [JsonProperty("user_id")]
        public int UserId { get; set; }

        [JsonProperty("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonProperty("phone")]
        public string Phone { get; set; } = string.Empty;

        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("address")]
        public string? Address { get; set; }

        [JsonProperty("city")]
        public string? City { get; set; }

        [JsonProperty("state")]
        public string? State { get; set; }

        [JsonProperty("postal_code")]
        public string? PostalCode { get; set; }

        [JsonProperty("delivery_method")]
        public string? DeliveryMethod { get; set; }

        [JsonProperty("subtotal")]
        public decimal Subtotal { get; set; }

        [JsonProperty("delivery_fee")]
        public decimal DeliveryFee { get; set; }

        [JsonProperty("total")]
        public decimal Total { get; set; }

        [JsonProperty("payment_method")]
        public string? PaymentMethod { get; set; }

        [JsonProperty("payment_status")]
        public string? PaymentStatus { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; } = "Pending";

        [JsonProperty("items_count")]
        public int ItemsCount { get; set; }

        [JsonProperty("created_at")]
        public string? CreatedAt { get; set; }

        public string FormattedTotal => $"₦{Total:N2}";
        public string FormattedSubtotal => $"₦{Subtotal:N2}";
        public string FormattedDeliveryFee => $"₦{DeliveryFee:N2}";
    }

    public class OrderDetailResult
    {
        [JsonProperty("order")]
        public Order Order { get; set; } = new();

        [JsonProperty("items")]
        public List<OrderItem> Items { get; set; } = new();
    }

    public class OrderItem
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("order_id")]
        public int OrderId { get; set; }

        [JsonProperty("product_id")]
        public int ProductId { get; set; }

        [JsonProperty("product_name")]
        public string ProductName { get; set; } = string.Empty;

        [JsonProperty("price")]
        public decimal Price { get; set; }

        [JsonProperty("quantity")]
        public int Quantity { get; set; }

        [JsonProperty("subtotal")]
        public decimal Subtotal { get; set; }

        [JsonProperty("image")]
        public string? Image { get; set; }

        public string FormattedPrice => $"₦{Price:N2}";
        public string FormattedSubtotal => $"₦{Subtotal:N2}";
    }
}
