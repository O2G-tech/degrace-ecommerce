using System.Windows;
using System.Windows.Controls;
using DeGraceAdmin.ViewModels;

namespace DeGraceAdmin.Views
{
    public partial class LoginView : UserControl
    {
        public LoginView()
        {
            InitializeComponent();
            TxtPassword.Password = "admin123";
        }

        private void TxtPassword_PasswordChanged(object sender, RoutedEventArgs e)
        {
            if (DataContext is LoginViewModel vm)
            {
                vm.Password = TxtPassword.Password;
            }
        }
    }
}
