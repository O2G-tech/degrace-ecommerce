using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class DashboardViewModel : BaseViewModel
    {
        private DashboardStats? _stats;
        public DashboardStats? Stats
        {
            get => _stats;
            set => SetProperty(ref _stats, value);
        }

        public ICommand RefreshCommand { get; }

        public DashboardViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadStatsAsync());
            _ = LoadStatsAsync();
        }

        public async Task LoadStatsAsync()
        {
            IsBusy = true;
            StatusMessage = "Refreshing analytics...";
            try
            {
                var res = await ApiService.Instance.GetDashboardStatsAsync();
                if (res.Success && res.Data != null)
                {
                    Stats = res.Data;
                }
                else
                {
                    StatusMessage = res.Message;
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
    }
}
