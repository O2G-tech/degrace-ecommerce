using Newtonsoft.Json;

namespace DeGraceAdmin.Models
{
    public class ApiResponse<T>
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; } = string.Empty;

        [JsonProperty("data")]
        public T? Data { get; set; }
    }

    public class LoginResult
    {
        [JsonProperty("user")]
        public User User { get; set; } = new();

        [JsonProperty("token")]
        public string Token { get; set; } = string.Empty;

        [JsonProperty("session_id")]
        public string SessionId { get; set; } = string.Empty;
    }
}
