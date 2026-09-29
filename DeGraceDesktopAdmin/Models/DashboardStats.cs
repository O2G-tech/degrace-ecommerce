using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class DashboardStats
    {
        [JsonProperty("products")]
        public int Products { get; set; }

        [JsonProperty("categories")]
        public int Categories { get; set; }

        [JsonProperty("customers")]
        public int Customers { get; set; }

        [JsonProperty("orders")]
        public int Orders { get; set; }

        [JsonProperty("revenue")]
        public decimal Revenue { get; set; }

        [JsonProperty("pending_orders")]
        public int PendingOrders { get; set; }

        [JsonProperty("processing_orders")]
        public int ProcessingOrders { get; set; }

        [JsonProperty("shipped_orders")]
        public int ShippedOrders { get; set; }

        [JsonProperty("delivered_orders")]
        public int DeliveredOrders { get; set; }

        [JsonProperty("cancelled_orders")]
        public int CancelledOrders { get; set; }

        [JsonProperty("today_orders")]
        public int TodayOrders { get; set; }

        [JsonProperty("today_revenue")]
        public decimal TodayRevenue { get; set; }

        [JsonProperty("low_stock_products")]
        public int LowStockProducts { get; set; }

        [JsonProperty("pending_reviews")]
        public int PendingReviews { get; set; }

        [JsonProperty("recent_orders")]
        public List<Order> RecentOrders { get; set; } = new();

        public string FormattedRevenue => $"₦{Revenue:N2}";
        public string FormattedTodayRevenue => $"₦{TodayRevenue:N2}";
    }
}
