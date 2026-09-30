using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using DeGraceAdmin.Models;
using Newtonsoft.Json;

namespace DeGraceAdmin.Services
{
    public class ApiService
    {
        private static ApiService? _instance;
        public static ApiService Instance => _instance ??= new ApiService();

        private readonly HttpClient _client;
        private readonly CookieContainer _cookieContainer;
        private string _baseUrl = "https://degrace-backend.onrender.com";
        private string? _token;

        public User? CurrentUser { get; private set; }
        public bool IsAuthenticated => CurrentUser != null && !string.IsNullOrEmpty(_token);
        public string BaseUrl => _baseUrl;

        private static string GetConfigFilePath()
        {
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var dir = Path.Combine(appData, "DeGraceAdmin");
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, "server_url.txt");
        }

        private ApiService()
        {
            try
            {
                var configFile = GetConfigFilePath();
                if (File.Exists(configFile))
                {
                    var saved = File.ReadAllText(configFile).Trim();
                    if (!string.IsNullOrWhiteSpace(saved))
                    {
                        _baseUrl = saved.TrimEnd('/');
                    }
                }
            }
            catch { }

            _cookieContainer = new CookieContainer();
            var handler = new HttpClientHandler
            {
                CookieContainer = _cookieContainer,
                UseCookies = true,
                AllowAutoRedirect = true
            };

            _client = new HttpClient(handler)
            {
                Timeout = TimeSpan.FromSeconds(20)
            };

            _client.DefaultRequestHeaders.Accept.Clear();
            _client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public void SetBaseUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return;
            _baseUrl = url.Trim().TrimEnd('/');
            try
            {
                File.WriteAllText(GetConfigFilePath(), _baseUrl);
            }
            catch { }
        }

        public void SetToken(string token)
        {
            _token = token;
            _client.DefaultRequestHeaders.Remove("Authorization");
            if (!string.IsNullOrEmpty(token))
            {
                _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            }
        }

        private async Task<ApiResponse<T>> SendRequestAsync<T>(HttpRequestMessage request)
        {
            try
            {
                var response = await _client.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();

                if (!string.IsNullOrWhiteSpace(content))
                {
                    var result = JsonConvert.DeserializeObject<ApiResponse<T>>(content);
                    if (result != null) return result;
                }

                return new ApiResponse<T>
                {
                    Success = response.IsSuccessStatusCode,
                    Message = $"HTTP {response.StatusCode}: {response.ReasonPhrase}"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<T>
                {
                    Success = false,
                    Message = $"Connection failed: {ex.Message}"
                };
            }
        }

        // ================= AUTH =================
        public async Task<ApiResponse<LoginResult>> LoginAsync(string email, string password)
        {
            var payload = new { email, password };
            var json = JsonConvert.SerializeObject(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/admin/login.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            var res = await SendRequestAsync<LoginResult>(request);
            if (res.Success && res.Data != null)
            {
                CurrentUser = res.Data.User;
                SetToken(res.Data.Token);
            }
            return res;
        }

        public async Task<ApiResponse<User>> CheckAuthAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/admin/check_auth.php");
            var res = await SendRequestAsync<User>(request);
            if (res.Success && res.Data != null)
            {
                CurrentUser = res.Data;
            }
            return res;
        }

        public async Task<ApiResponse<object>> LogoutAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/admin/logout.php");
            var res = await SendRequestAsync<object>(request);
            CurrentUser = null;
            SetToken(string.Empty);
            return res;
        }

        // ================= DASHBOARD =================
        public async Task<ApiResponse<DashboardStats>> GetDashboardStatsAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/admin/dashboard.php");
            return await SendRequestAsync<DashboardStats>(request);
        }

        // ================= PRODUCTS =================
        public async Task<ApiResponse<List<Product>>> GetProductsAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/products/get.php");
            return await SendRequestAsync<List<Product>>(request);
        }

        public async Task<ApiResponse<Product>> CreateProductAsync(Product product, string? localImagePath = null)
        {
            if (!string.IsNullOrEmpty(localImagePath) && File.Exists(localImagePath))
            {
                using var form = new MultipartFormDataContent();
                form.Add(new StringContent(product.CategoryId?.ToString() ?? "0"), "category_id");
                form.Add(new StringContent(product.Name), "name");
                form.Add(new StringContent(product.Description ?? ""), "description");
                form.Add(new StringContent(product.Price.ToString()), "price");
                form.Add(new StringContent(product.Stock.ToString()), "stock");
                form.Add(new StringContent(product.Status), "status");

                var fileBytes = await File.ReadAllBytesAsync(localImagePath);
                var fileContent = new ByteArrayContent(fileBytes);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                form.Add(fileContent, "image", Path.GetFileName(localImagePath));

                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/products/create.php")
                {
                    Content = form
                };
                return await SendRequestAsync<Product>(request);
            }
            else
            {
                var json = JsonConvert.SerializeObject(product);
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/products/create.php")
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };
                return await SendRequestAsync<Product>(request);
            }
        }

        public async Task<ApiResponse<Product>> UpdateProductAsync(Product product, string? localImagePath = null)
        {
            if (!string.IsNullOrEmpty(localImagePath) && File.Exists(localImagePath))
            {
                using var form = new MultipartFormDataContent();
                form.Add(new StringContent(product.Id.ToString()), "id");
                form.Add(new StringContent(product.CategoryId?.ToString() ?? "0"), "category_id");
                form.Add(new StringContent(product.Name), "name");
                form.Add(new StringContent(product.Description ?? ""), "description");
                form.Add(new StringContent(product.Price.ToString()), "price");
                form.Add(new StringContent(product.Stock.ToString()), "stock");
                form.Add(new StringContent(product.Status), "status");

                var fileBytes = await File.ReadAllBytesAsync(localImagePath);
                var fileContent = new ByteArrayContent(fileBytes);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                form.Add(fileContent, "image", Path.GetFileName(localImagePath));

                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/products/update.php")
                {
                    Content = form
                };
                return await SendRequestAsync<Product>(request);
            }
            else
            {
                var json = JsonConvert.SerializeObject(product);
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/products/update.php")
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };
                return await SendRequestAsync<Product>(request);
            }
        }

        public async Task<ApiResponse<object>> DeleteProductAsync(int productId)
        {
            var json = JsonConvert.SerializeObject(new { id = productId });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/products/delete.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        // ================= CATEGORIES =================
        public async Task<ApiResponse<List<Category>>> GetCategoriesAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/categories/admin_get.php");
            return await SendRequestAsync<List<Category>>(request);
        }

        public async Task<ApiResponse<Category>> CreateCategoryAsync(Category category)
        {
            var json = JsonConvert.SerializeObject(category);
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/categories/create.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<Category>(request);
        }

        public async Task<ApiResponse<Category>> UpdateCategoryAsync(Category category)
        {
            var json = JsonConvert.SerializeObject(category);
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/categories/update.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<Category>(request);
        }

        public async Task<ApiResponse<object>> DeleteCategoryAsync(int categoryId)
        {
            var json = JsonConvert.SerializeObject(new { id = categoryId });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/categories/delete.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        // ================= ORDERS =================
        public async Task<ApiResponse<List<Order>>> GetOrdersAsync(string status = "all", string search = "")
        {
            var url = $"{_baseUrl}/orders/admin_get.php?status={Uri.EscapeDataString(status)}&search={Uri.EscapeDataString(search)}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            return await SendRequestAsync<List<Order>>(request);
        }

        public async Task<ApiResponse<OrderDetailResult>> GetOrderDetailAsync(int orderId)
        {
            var url = $"{_baseUrl}/orders/single.php?id={orderId}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            return await SendRequestAsync<OrderDetailResult>(request);
        }

        public async Task<ApiResponse<object>> UpdateOrderStatusAsync(int orderId, string status)
        {
            var json = JsonConvert.SerializeObject(new { id = orderId, status });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/orders/update-status.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        public async Task<ApiResponse<object>> SendOrderNoteAsync(int orderId, string note)
        {
            var json = JsonConvert.SerializeObject(new { id = orderId, note });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/orders/add_note.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        // ================= USERS / CUSTOMERS =================
        public async Task<ApiResponse<List<User>>> GetUsersAsync(string role = "all", string search = "")
        {
            var url = $"{_baseUrl}/admin/users.php?role={Uri.EscapeDataString(role)}&search={Uri.EscapeDataString(search)}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            return await SendRequestAsync<List<User>>(request);
        }

        public async Task<ApiResponse<object>> ToggleUserStatusAsync(int userId)
        {
            var json = JsonConvert.SerializeObject(new { id = userId, action = "toggle_status" });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/admin/users.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        // ================= REVIEWS =================
        public async Task<ApiResponse<ReviewsResponse>> GetReviewsAsync(string status = "all", string search = "")
        {
            var url = $"{_baseUrl}/reviews/admin_get.php?status={Uri.EscapeDataString(status)}&search={Uri.EscapeDataString(search)}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            return await SendRequestAsync<ReviewsResponse>(request);
        }

        public async Task<ApiResponse<object>> UpdateReviewStatusAsync(int reviewId, string status)
        {
            var json = JsonConvert.SerializeObject(new { id = reviewId, status });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/reviews/update_status.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        public async Task<ApiResponse<object>> ReplyToReviewAsync(int reviewId, string reply)
        {
            var json = JsonConvert.SerializeObject(new { id = reviewId, reply });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/reviews/reply.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }

        public async Task<ApiResponse<object>> DeleteReviewAsync(int reviewId)
        {
            var json = JsonConvert.SerializeObject(new { id = reviewId });
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/reviews/delete.php")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            return await SendRequestAsync<object>(request);
        }
    }
}
