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
        }
    }
}
