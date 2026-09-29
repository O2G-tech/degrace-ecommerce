using System.Collections.ObjectModel;
using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class CategoriesViewModel : BaseViewModel
    {
        private ObservableCollection<Category> _categories = new();
        public ObservableCollection<Category> Categories
        {
            get => _categories;
            set => SetProperty(ref _categories, value);
        }

        private Category? _selectedCategory;
        public Category? SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value))
                {
                    (DeleteCategoryCommand as RelayCommand)?.RaiseCanExecuteChanged();
                    (OpenEditModalCommand as RelayCommand)?.RaiseCanExecuteChanged();
                }
            }
        }

        private bool _isAddModalOpen;
        public bool IsAddModalOpen
        {
            get => _isAddModalOpen;
            set => SetProperty(ref _isAddModalOpen, value);
        }

        private bool _isEditMode;
        public bool IsEditMode
        {
            get => _isEditMode;
            set => SetProperty(ref _isEditMode, value);
        }

        private int _editingCategoryId;
        public int EditingCategoryId
        {
            get => _editingCategoryId;
            set => SetProperty(ref _editingCategoryId, value);
        }

        private string _modalTitle = "CREATE NEW COLLECTION";
        public string ModalTitle
        {
            get => _modalTitle;
            set => SetProperty(ref _modalTitle, value);
        }

        private string _newCategoryName = string.Empty;
        public string NewCategoryName
        {
            get => _newCategoryName;
            set => SetProperty(ref _newCategoryName, value);
        }

        private string _newCategoryImage = string.Empty;
        public string NewCategoryImage
        {
            get => _newCategoryImage;
            set => SetProperty(ref _newCategoryImage, value);
        }

        public ICommand RefreshCommand { get; }
        public ICommand DeleteCategoryCommand { get; }
        public ICommand OpenAddModalCommand { get; }
        public ICommand OpenEditModalCommand { get; }
        public ICommand CloseAddModalCommand { get; }
        public ICommand SaveCategoryCommand { get; }

        public CategoriesViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadCategoriesAsync());
            DeleteCategoryCommand = new RelayCommand(async () => await DeleteSelectedCategoryAsync(), () => SelectedCategory != null);
            
            OpenAddModalCommand = new RelayCommand(() =>
            {
                IsEditMode = false;
                EditingCategoryId = 0;
                ModalTitle = "CREATE NEW COLLECTION";
                NewCategoryName = string.Empty;
                NewCategoryImage = string.Empty;
                IsAddModalOpen = true;
            });

            OpenEditModalCommand = new RelayCommand(() =>
            {
                if (SelectedCategory == null) return;
                IsEditMode = true;
                EditingCategoryId = SelectedCategory.Id;
                ModalTitle = $"EDIT COLLECTION: {SelectedCategory.Name}";
                NewCategoryName = SelectedCategory.Name;
                NewCategoryImage = SelectedCategory.Image ?? string.Empty;
                IsAddModalOpen = true;
            }, () => SelectedCategory != null);

            CloseAddModalCommand = new RelayCommand(() => IsAddModalOpen = false);
            SaveCategoryCommand = new RelayCommand(async () => await SaveCategoryAsync());

            _ = LoadCategoriesAsync();
        }

        public async Task LoadCategoriesAsync()
        {
            IsBusy = true;
            StatusMessage = "Loading categories...";
            try
            {
                var res = await ApiService.Instance.GetCategoriesAsync();
                if (res.Success && res.Data != null)
                {
                    Categories = new ObservableCollection<Category>(res.Data);
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

        public async Task SaveCategoryAsync()
        {
            if (string.IsNullOrWhiteSpace(NewCategoryName))
            {
                StatusMessage = "Collection name is required.";
                return;
            }

            IsBusy = true;
            try
            {
                var cat = new Category
                {
                    Id = EditingCategoryId,
                    Name = NewCategoryName.Trim(),
                    Image = NewCategoryImage,
                    Status = "active"
                };

                ApiResponse<Category> res;
                if (IsEditMode && EditingCategoryId > 0)
                {
                    res = await ApiService.Instance.UpdateCategoryAsync(cat);
                }
                else
                {
                    res = await ApiService.Instance.CreateCategoryAsync(cat);
                }

                if (res.Success)
                {
                    IsAddModalOpen = false;
                    await LoadCategoriesAsync();
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

        public async Task DeleteSelectedCategoryAsync()
        {
            if (SelectedCategory == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.DeleteCategoryAsync(SelectedCategory.Id);
                if (res.Success)
                {
                    await LoadCategoriesAsync();
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
