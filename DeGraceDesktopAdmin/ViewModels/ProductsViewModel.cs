using System.Collections.ObjectModel;
using System.Windows.Input;
using DeGraceAdmin.Models;
using DeGraceAdmin.Services;

namespace DeGraceAdmin.ViewModels
{
    public class ProductsViewModel : BaseViewModel
    {
        private ObservableCollection<Product> _products = new();
        public ObservableCollection<Product> Products
        {
            get => _products;
            set => SetProperty(ref _products, value);
        }

        private ObservableCollection<Category> _availableCategories = new();
        public ObservableCollection<Category> AvailableCategories
        {
            get => _availableCategories;
            set => SetProperty(ref _availableCategories, value);
        }

        private Product? _selectedProduct;
        public Product? SelectedProduct
        {
            get => _selectedProduct;
            set
            {
                if (SetProperty(ref _selectedProduct, value))
                {
                    (DeleteProductCommand as RelayCommand)?.RaiseCanExecuteChanged();
                    (OpenEditModalCommand as RelayCommand)?.RaiseCanExecuteChanged();
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
                    FilterProducts();
                }
            }
        }

        // Add / Edit Product Form properties
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

        private int _editingProductId;
        public int EditingProductId
        {
            get => _editingProductId;
            set => SetProperty(ref _editingProductId, value);
        }

        private string _modalTitle = "CURATE NEW BOUTIQUE PIECE";
        public string ModalTitle
        {
            get => _modalTitle;
            set => SetProperty(ref _modalTitle, value);
        }

        private string _newProductName = string.Empty;
        public string NewProductName
        {
            get => _newProductName;
            set => SetProperty(ref _newProductName, value);
        }

        private decimal _newProductPrice;
        public decimal NewProductPrice
        {
            get => _newProductPrice;
            set => SetProperty(ref _newProductPrice, value);
        }

        private int _newProductStock = 10;
        public int NewProductStock
        {
            get => _newProductStock;
            set => SetProperty(ref _newProductStock, value);
        }

        private string _newProductDescription = string.Empty;
        public string NewProductDescription
        {
            get => _newProductDescription;
            set => SetProperty(ref _newProductDescription, value);
        }

        private string _newProductImage = string.Empty;
        public string NewProductImage
        {
            get => _newProductImage;
            set => SetProperty(ref _newProductImage, value);
        }

        private Category? _selectedNewCategory;
        public Category? SelectedNewCategory
        {
            get => _selectedNewCategory;
            set => SetProperty(ref _selectedNewCategory, value);
        }

        private List<Product> _allProducts = new();

        public ICommand RefreshCommand { get; }
        public ICommand DeleteProductCommand { get; }
        public ICommand OpenAddModalCommand { get; }
        public ICommand OpenEditModalCommand { get; }
        public ICommand CloseAddModalCommand { get; }
        public ICommand SaveProductCommand { get; }

        public ProductsViewModel()
        {
            RefreshCommand = new RelayCommand(async () => await LoadProductsAsync());
            DeleteProductCommand = new RelayCommand(async () => await DeleteSelectedProductAsync(), () => SelectedProduct != null);

            OpenAddModalCommand = new RelayCommand(() => 
            {
                IsEditMode = false;
                EditingProductId = 0;
                ModalTitle = "CURATE NEW BOUTIQUE PIECE";
                NewProductName = string.Empty;
                NewProductPrice = 0;
                NewProductStock = 10;
                NewProductDescription = string.Empty;
                NewProductImage = string.Empty;
                IsAddModalOpen = true;
            });

            OpenEditModalCommand = new RelayCommand(() =>
            {
                if (SelectedProduct == null) return;
                IsEditMode = true;
                EditingProductId = SelectedProduct.Id;
                ModalTitle = $"EDIT PIECE: {SelectedProduct.Name}";
                NewProductName = SelectedProduct.Name;
                NewProductPrice = SelectedProduct.Price;
                NewProductStock = SelectedProduct.Stock;
                NewProductDescription = SelectedProduct.Description ?? string.Empty;
                NewProductImage = SelectedProduct.Image ?? string.Empty;
                SelectedNewCategory = AvailableCategories.FirstOrDefault(c => c.Id == SelectedProduct.CategoryId) ?? AvailableCategories.FirstOrDefault();
                IsAddModalOpen = true;
            }, () => SelectedProduct != null);

            CloseAddModalCommand = new RelayCommand(() => IsAddModalOpen = false);
            SaveProductCommand = new RelayCommand(async () => await SaveProductAsync(), () => !IsBusy);

            _ = LoadProductsAsync();
            _ = LoadCategoriesAsync();
        }

        public async Task LoadCategoriesAsync()
        {
            try
            {
                var res = await ApiService.Instance.GetCategoriesAsync();
                if (res.Success && res.Data != null)
                {
                    AvailableCategories = new ObservableCollection<Category>(res.Data);
                    if (AvailableCategories.Count > 0 && SelectedNewCategory == null)
                    {
                        SelectedNewCategory = AvailableCategories[0];
                    }
                }
            }
            catch { }
        }

        public async Task LoadProductsAsync()
        {
            IsBusy = true;
            StatusMessage = "Loading product catalogue...";
            try
            {
                var res = await ApiService.Instance.GetProductsAsync();
                if (res.Success && res.Data != null)
                {
                    _allProducts = res.Data;
                    FilterProducts();
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

        private void FilterProducts()
        {
            if (string.IsNullOrWhiteSpace(SearchQuery))
            {
                Products = new ObservableCollection<Product>(_allProducts);
            }
            else
            {
                var q = SearchQuery.Trim().ToLowerInvariant();
                var filtered = _allProducts.Where(p => 
                    p.Name.ToLowerInvariant().Contains(q) || 
                    (p.CategoryName?.ToLowerInvariant().Contains(q) ?? false) ||
                    (p.Description?.ToLowerInvariant().Contains(q) ?? false)
                );
                Products = new ObservableCollection<Product>(filtered);
            }
        }

        public async Task SaveProductAsync()
        {
            if (string.IsNullOrWhiteSpace(NewProductName))
            {
                StatusMessage = "Product name is required.";
                return;
            }

            IsBusy = true;
            try
            {
                var prod = new Product
                {
                    Id = EditingProductId,
                    Name = NewProductName.Trim(),
                    Price = NewProductPrice,
                    Stock = NewProductStock,
                    Description = NewProductDescription,
                    Image = NewProductImage,
                    CategoryId = SelectedNewCategory?.Id ?? 1,
                    Status = "active"
                };

                ApiResponse<Product> res;
                if (IsEditMode && EditingProductId > 0)
                {
                    res = await ApiService.Instance.UpdateProductAsync(prod);
                }
                else
                {
                    res = await ApiService.Instance.CreateProductAsync(prod);
                }

                if (res.Success)
                {
                    IsAddModalOpen = false;
                    await LoadProductsAsync();
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

        public async Task DeleteSelectedProductAsync()
        {
            if (SelectedProduct == null) return;

            IsBusy = true;
            try
            {
                var res = await ApiService.Instance.DeleteProductAsync(SelectedProduct.Id);
                if (res.Success)
                {
                    await LoadProductsAsync();
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
