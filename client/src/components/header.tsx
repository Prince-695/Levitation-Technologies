import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // Adjust the path as necessary
const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still logout and redirect even if there's an error
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-[#1f1f1f] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="flex items-center">
              <div className="ml-3">
                <img src={logo} alt="logo" />
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:block text-gray-200 text-md">
                  Welcome, <span className="font-medium">{user?.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[#ccf575] text-[##292C20] px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {location.pathname === '/register' ? (
                  <button
                    onClick={handleLogin}
                    className="bg-[#ccf575] hover:bg-[#ccf575] text-[##292C20] px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 "
                  >
                    Login
                  </button>
                ) : location.pathname === '/login' ? (
                    <button
                    onClick={handleRegister}
                    className="bg-transparent border-2 border-[#ccf575] text-[#ccf575] px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 "
                    >
                    Connecting to people with Technology
                    </button>
                ) : (
                  <>
                    <button
                      onClick={handleLogin}
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleRegister}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;