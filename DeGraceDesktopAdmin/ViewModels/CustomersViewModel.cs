using System.Collections.ObjectModel;
using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class CustomersViewModel : BaseViewModel
    {
        private ObservableCollection<User> _customers = new();
        public ObservableCollection<User> Customers
        {
            get => _customers;
            set => SetProperty(ref _customers, value);
        }

        private User? _selectedCustomer;
        public User? SelectedCustomer
        {
            get => _selectedCustomer;
            set
            {
                if (SetProperty(ref _selectedCustomer, value))
                {
                    (ToggleStatusCommand as RelayCommand)?.RaiseCanExecuteChanged();
                    (SuspendCommand as RelayCommand)?.RaiseCanExecuteChanged();
                }
            }
        }

        private string _searchQuery = string.Empty;
        public string SearchQuery
        {
            get => _searchQuery;
            set
            {
                if (SetProperty(ref _searchQuery, value))
                {
                    _ = LoadCustomersAsync();
                }
            }
        }

        public ICommand RefreshCommand { get; }
        public ICommand ToggleStatusCommand { get; }
        public ICommand SuspendCommand { get; }

        public CustomersViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadCustomersAsync());
            ToggleStatusCommand = new RelayCommand(async () => await ToggleSelectedCustomerStatusAsync(), () => SelectedCustomer != null);
            SuspendCommand = new RelayCommand(async () => await ToggleSelectedCustomerStatusAsync(), () => SelectedCustomer != null);

            _ = LoadCustomersAsync();
        }

        public async Task LoadCustomersAsync()
        {
            IsBusy = true;
            StatusMessage = "Loading clients...";
            try
            {
                var res = await ApiService.Instance.GetUsersAsync("customer", SearchQuery);
                if (res.Success && res.Data != null)
                {
                    Customers = new ObservableCollection<User>(res.Data);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }

        public async Task ToggleSelectedCustomerStatusAsync()
        {
            if (SelectedCustomer == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.ToggleUserStatusAsync(SelectedCustomer.Id);
                if (res.Success)
                {
                    var newStatus = string.Equals(SelectedCustomer.Status, "active", StringComparison.OrdinalIgnoreCase) ? "suspended" : "active";
                    StatusMessage = $"Client '{SelectedCustomer.Name}' status updated to {newStatus.ToUpper()}.";
                    await LoadCustomersAsync();
                }
                else
                {
                    StatusMessage = res.Message;
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error updating status: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
