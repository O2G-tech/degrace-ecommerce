using System.Windows;
using DeGraceAdmin.ViewModels;

namespace DeGraceAdmin
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            var mainVm = new MainViewModel();
            DataContext = mainVm;

            mainVm.OnLogoutRequested += () =>
            {
                var loginWindow = new LoginWindow();
                loginWindow.Show();
                Close();
            };

            // Refresh all data once window is fully loaded (token is set by then)
            Loaded += async (_, _) => await mainVm.RefreshAllDataAsync();
        }
    }
}
