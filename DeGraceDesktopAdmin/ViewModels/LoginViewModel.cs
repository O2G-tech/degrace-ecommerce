using System.Windows.Input;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class LoginViewModel : BaseViewModel
    {
        private string _serverUrl = ApiService.Instance.BaseUrl;
        public string ServerUrl
        {
            get => _serverUrl;
            set
            {
                if (SetProperty(ref _serverUrl, value))
                {
                    ApiService.Instance.SetBaseUrl(value);
                }
            }
        }

        private string _email = "admin@degrace.com";
        public string Email
        {
            get => _email;
            set => SetProperty(ref _email, value);
        }

        private string _password = "admin123";
        public string Password
        {
            get => _password;
            set => SetProperty(ref _password, value);
        }

        private string _errorMessage = string.Empty;
        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public ICommand LoginCommand { get; }

        public event Action? OnLoginSuccessful;

        public LoginViewModel()
        {
            LoginCommand = new RelayCommand(async () => await ExecuteLoginAsync(), () => !IsBusy);
        }

        private async Task ExecuteLoginAsync()
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
                ErrorMessage = "Please enter both administrator email and password.";
                return;
            }

            IsBusy = true;
            ErrorMessage = string.Empty;
            StatusMessage = "Authenticating executive session...";

            try
            {
                var result = await ApiService.Instance.LoginAsync(Email.Trim(), Password);

                if (result.Success)
                {
                    StatusMessage = "Authentication successful.";
                    OnLoginSuccessful?.Invoke();
                }
                else
                {
                    ErrorMessage = result.Message ?? "Invalid administrator credentials or unauthorized role.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Server connection failed: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
                StatusMessage = string.Empty;
            }
        }
    }
}
