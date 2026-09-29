using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class User
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("phone")]
        public string? Phone { get; set; }

        [JsonProperty("role")]
        public string Role { get; set; } = "customer";

        [JsonProperty("status")]
        public string Status { get; set; } = "active";

        [JsonProperty("order_count")]
        public int OrderCount { get; set; }

        [JsonProperty("total_spent")]
        public decimal TotalSpent { get; set; }

        [JsonProperty("created_at")]
        public string? CreatedAt { get; set; }

        public bool IsActive => string.Equals(Status, "active", StringComparison.OrdinalIgnoreCase);
        public bool IsAdmin => string.Equals(Role, "admin", StringComparison.OrdinalIgnoreCase);
        public string FormattedTotalSpent => $"₦{TotalSpent:N2}";
    }
}
