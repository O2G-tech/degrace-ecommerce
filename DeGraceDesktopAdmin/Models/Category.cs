using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class Category
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("parent_id")]
        public int? ParentId { get; set; }

        [JsonProperty("parent_name")]
        public string? ParentName { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonProperty("image")]
        public string? Image { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; } = "active";

        [JsonProperty("product_count")]
        public int ProductCount { get; set; }

        [JsonProperty("created_at")]
        public string? CreatedAt { get; set; }

        public bool IsActive => string.Equals(Status, "active", StringComparison.OrdinalIgnoreCase);
        public bool IsSubCategory => ParentId.HasValue && ParentId.Value > 0;
        public string DisplayName => IsSubCategory ? $"  ↳ {Name} ({ParentName})" : Name;
    }
}
