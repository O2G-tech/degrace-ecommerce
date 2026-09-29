using System.Collections.ObjectModel;
using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class ReviewsViewModel : BaseViewModel
    {
        private ObservableCollection<Review> _reviews = new();
        public ObservableCollection<Review> Reviews
        {
            get => _reviews;
            set => SetProperty(ref _reviews, value);
        }

        private Review? _selectedReview;
        public Review? SelectedReview
        {
            get => _selectedReview;
            set
            {
                if (SetProperty(ref _selectedReview, value))
                {
                    ReplyText = value?.AdminReply ?? string.Empty;
                }
            }
        }

        private string _replyText = string.Empty;
        public string ReplyText
        {
            get => _replyText;
            set => SetProperty(ref _replyText, value);
        }

        private string _statusFilter = "all";
        public string StatusFilter
        {
            get => _statusFilter;
            set
            {
                if (SetProperty(ref _statusFilter, value))
                {
                    _ = LoadReviewsAsync();
                }
            }
        }

        public ICommand RefreshCommand { get; }
        public ICommand ApproveCommand { get; }
        public ICommand RejectCommand { get; }
        public ICommand SendReplyCommand { get; }
        public ICommand DeleteCommand { get; }

        public ReviewsViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadReviewsAsync());
            ApproveCommand = new RelayCommand(async () => await SetStatusAsync("approved"), () => SelectedReview != null);
            RejectCommand = new RelayCommand(async () => await SetStatusAsync("rejected"), () => SelectedReview != null);
            SendReplyCommand = new RelayCommand(async () => await SendReplyAsync(), () => SelectedReview != null);
            DeleteCommand = new RelayCommand(async () => await DeleteSelectedReviewAsync(), () => SelectedReview != null);

            _ = LoadReviewsAsync();
        }

        public async Task LoadReviewsAsync()
        {
            IsBusy = true;
            StatusMessage = "Loading reviews...";
            try
            {
                var res = await ApiService.Instance.GetReviewsAsync(StatusFilter);
                if (res.Success && res.Data != null)
                {
                    Reviews = new ObservableCollection<Review>(res.Data.Reviews);
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

        public async Task SetStatusAsync(string status)
        {
            if (SelectedReview == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.UpdateReviewStatusAsync(SelectedReview.Id, status);
                if (res.Success)
                {
                    SelectedReview.Status = status;
                    await LoadReviewsAsync();
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

        public async Task SendReplyAsync()
        {
            if (SelectedReview == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.ReplyToReviewAsync(SelectedReview.Id, ReplyText);
                if (res.Success)
                {
                    SelectedReview.AdminReply = ReplyText;
                    StatusMessage = "Reply posted successfully.";
                    await LoadReviewsAsync();
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

        public async Task DeleteSelectedReviewAsync()
        {
            if (SelectedReview == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.DeleteReviewAsync(SelectedReview.Id);
                if (res.Success)
                {
                    await LoadReviewsAsync();
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
    }
}
