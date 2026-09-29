using System.Windows;
using DeGraceAdmin.ViewModels;

namespace DeGraceAdmin
{
    public partial class LoginWindow : Window
    {
        public LoginWindow()
        {
            InitializeComponent();
            var loginVm = new LoginViewModel();
            LoginControl.DataContext = loginVm;

            loginVm.OnLoginSuccessful += () =>
            {
                var mainWindow = new MainWindow();
                mainWindow.Show();
                Close();
            };
        }
    }
}
