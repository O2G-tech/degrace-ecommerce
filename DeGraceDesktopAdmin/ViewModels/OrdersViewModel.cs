using System.Collections.ObjectModel;
using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class OrdersViewModel : BaseViewModel
    {
        private ObservableCollection<Order> _orders = new();
        public ObservableCollection<Order> Orders
        {
            get => _orders;
            set => SetProperty(ref _orders, value);
        }

        private Order? _selectedOrder;
        public Order? SelectedOrder
        {
            get => _selectedOrder;
            set
            {
                if (SetProperty(ref _selectedOrder, value) && value != null)
                {
                    _ = LoadOrderDetailAsync(value.Id);
                }
            }
        }

        private OrderDetailResult? _currentOrderDetail;
        public OrderDetailResult? CurrentOrderDetail
        {
            get => _currentOrderDetail;
            set => SetProperty(ref _currentOrderDetail, value);
        }

        private string _statusFilter = "all";
        public string StatusFilter
        {
            get => _statusFilter;
            set
            {
                if (SetProperty(ref _statusFilter, value))
                {
                    _ = LoadOrdersAsync();
                }
            }
        }

        private string _searchQuery = string.Empty;
        public string SearchQuery
        {
            get => _searchQuery;
            set => SetProperty(ref _searchQuery, value);
        }

        private string _adminNote = string.Empty;
        public string AdminNote
        {
            get => _adminNote;
            set => SetProperty(ref _adminNote, value);
        }

        public ICommand RefreshCommand { get; }
        public ICommand SearchCommand { get; }
        public ICommand UpdateStatusCommand { get; }
        public ICommand SendNoteCommand { get; }

        public OrdersViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadOrdersAsync());
            SearchCommand = new RelayCommand(async () => await LoadOrdersAsync());
            UpdateStatusCommand = new RelayCommand(async (statusObj) => 
            {
                if (statusObj is string newStatus && SelectedOrder != null)
                {
                    await UpdateSelectedOrderStatusAsync(newStatus);
                }
            });

            SendNoteCommand = new RelayCommand(async () => await SendAdminNoteAsync(), () => SelectedOrder != null && !string.IsNullOrWhiteSpace(AdminNote));

            _ = LoadOrdersAsync();
        }

        public async Task LoadOrdersAsync()
        {
            IsBusy = true;
            StatusMessage = "Loading client orders...";
            try
            {
                var res = await ApiService.Instance.GetOrdersAsync(StatusFilter, SearchQuery);
                if (res.Success && res.Data != null)
                {
                    Orders = new ObservableCollection<Order>(res.Data);
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

        public async Task LoadOrderDetailAsync(int orderId)
        {
            try
            {
                var res = await ApiService.Instance.GetOrderDetailAsync(orderId);
                if (res.Success && res.Data != null)
                {
                    CurrentOrderDetail = res.Data;
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to load order items: {ex.Message}";
            }
        }

        public async Task UpdateSelectedOrderStatusAsync(string newStatus)
        {
            if (SelectedOrder == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.UpdateOrderStatusAsync(SelectedOrder.Id, newStatus);
                if (res.Success)
                {
                    SelectedOrder.Status = newStatus;
                    StatusMessage = $"Order #{SelectedOrder.OrderNumber} status set to '{newStatus}'. Client notified.";
                    await LoadOrdersAsync();
                }
                else
                {
                    StatusMessage = res.Message;
                }
            }
            finally
            {
                IsBusy = false;
            }
        }

        public async Task SendAdminNoteAsync()
        {
            if (SelectedOrder == null || string.IsNullOrWhiteSpace(AdminNote)) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.SendOrderNoteAsync(SelectedOrder.Id, AdminNote.Trim());
                if (res.Success)
                {
                    StatusMessage = $"Message sent to client for Order #{SelectedOrder.OrderNumber}.";
                    AdminNote = string.Empty;
                    await LoadOrderDetailAsync(SelectedOrder.Id);
                }
                else
                {
                    StatusMessage = res.Message;
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Failed to send message: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
