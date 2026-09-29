using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class MainViewModel : BaseViewModel
    {
        private object? _currentView;
        public object? CurrentView
        {
            get => _currentView;
            set => SetProperty(ref _currentView, value);
        }

        private string _activeSection = "Dashboard";
        public string ActiveSection
        {
            get => _activeSection;
            set => SetProperty(ref _activeSection, value);
        }

        private bool _isSettingsModalOpen;
        public bool IsSettingsModalOpen
        {
            get => _isSettingsModalOpen;
            set => SetProperty(ref _isSettingsModalOpen, value);
        }

        private string _serverUrl = "http://localhost/backend";
        public string ServerUrl
        {
            get => _serverUrl;
            set => SetProperty(ref _serverUrl, value);
        }

        private string _serverConnectionStatus = string.Empty;
        public string ServerConnectionStatus
        {
            get => _serverConnectionStatus;
            set => SetProperty(ref _serverConnectionStatus, value);
        }

        public User? CurrentUser => ApiService.Instance.CurrentUser;

        public DashboardViewModel DashboardVM { get; } = new();
        public ProductsViewModel ProductsVM { get; } = new();
        public OrdersViewModel OrdersVM { get; } = new();
        public CategoriesViewModel CategoriesVM { get; } = new();
        public CustomersViewModel CustomersVM { get; } = new();
        public ReviewsViewModel ReviewsVM { get; } = new();

        public ICommand NavigateCommand { get; }
        public ICommand LogoutCommand { get; }
        public ICommand OpenSettingsCommand { get; }
        public ICommand CloseSettingsCommand { get; }
        public ICommand SaveServerUrlCommand { get; }

        public event Action? OnLogoutRequested;

        public MainViewModel()
        {
            NavigateCommand = new RelayCommand(param =>
            {
                if (param is string section)
                {
                    NavigateTo(section);
                }
            });

            LogoutCommand = new RelayCommand(async () =>
            {
                await ApiService.Instance.LogoutAsync();
                OnLogoutRequested?.Invoke();
            });

            OpenSettingsCommand = new RelayCommand(() =>
            {
                ServerConnectionStatus = string.Empty;
                IsSettingsModalOpen = true;
            });

            CloseSettingsCommand = new RelayCommand(() => IsSettingsModalOpen = false);

            SaveServerUrlCommand = new RelayCommand(async () =>
            {
                if (!string.IsNullOrWhiteSpace(ServerUrl))
                {
                    ApiService.Instance.SetBaseUrl(ServerUrl);
                    ServerConnectionStatus = "Testing connection...";
                    var check = await ApiService.Instance.CheckAuthAsync();
                    if (check.Success)
                    {
                        ServerConnectionStatus = "✓ Connected successfully!";
                        await Task.Delay(1000);
                        IsSettingsModalOpen = false;
                    }
                    else
                    {
                        ServerConnectionStatus = $"Connection notice: {check.Message}";
                    }
                }
            });

            // Default to Dashboard
            NavigateTo("Dashboard");
        }

        public void NavigateTo(string section)
        {
            ActiveSection = section;
            CurrentView = section switch
            {
                "Dashboard" => DashboardVM,
                "Products" => ProductsVM,
                "Orders" => OrdersVM,
                "Categories" => CategoriesVM,
                "Customers" => CustomersVM,
                "Reviews" => ReviewsVM,
                _ => DashboardVM
            };
        }
    }
}
