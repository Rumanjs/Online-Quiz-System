import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Moon, Sun, LogOut, CheckCircle } from 'lucide-react';

export default function Layout() {
  const { user, userData, logout } = useAuthStore();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">QuizMaster</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                    {userData?.displayName || user.email}
                  </span>
                  {userData?.role === 'admin' && (
                    <Link to="/admin" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md transition-colors"
                  >
                    <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" className="text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors shadow-sm">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mx-auto py-8">
        <Outlet />
      </main>
    </div>
  );
}
