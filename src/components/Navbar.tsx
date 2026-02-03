import React, { useState, useRef, useEffect } from 'react';
import { Heart, LogOut, User, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index';
import { logoutUser } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, username, firstName, email, userType } = useAppSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegisterDropdownOpen, setIsRegisterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const registerDropdownRef = useRef<HTMLDivElement>(null);

  const displayName = firstName || username || 'User';

  // Get role-specific styling
  const getRoleBadgeColor = () => {
    switch (userType) {
      case 'provider':
        return 'bg-teal-100 text-teal-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (registerDropdownRef.current && !registerDropdownRef.current.contains(event.target as Node)) {
        setIsRegisterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/" : "/"} className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              sympti<span className="text-blue-600">Z</span>
            </span>
          </Link>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition border border-gray-200"
                >
                  <div className="bg-blue-600 p-1.5 rounded-full">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700 text-sm">
                    {displayName}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info with Role Badge */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${getRoleBadgeColor()}`}>
                          {userType || 'User'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{email}</p>
                    </div>

                    {/* Menu Items - Role-based */}
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span>{userType === 'provider' ? 'Dashboard' : userType === 'admin' ? 'Admin Panel' : 'My Profile'}</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition"
                      >
                        <Settings className="w-4 h-4 text-blue-600" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition text-sm"
                >
                  Login
                </Link>

                {/* Register Dropdown */}
                <div className="relative" ref={registerDropdownRef}>
                  <button
                    onClick={() => setIsRegisterDropdownOpen(!isRegisterDropdownOpen)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm text-sm flex items-center space-x-1"
                  >
                    <span>Register</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isRegisterDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isRegisterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          navigate('/register');
                          setIsRegisterDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition w-full text-left"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Register as Patient</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/provider/register');
                          setIsRegisterDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 transition w-full text-left"
                      >
                        <Heart className="w-4 h-4 text-teal-600" />
                        <span className="font-medium">Register as Doctor</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;