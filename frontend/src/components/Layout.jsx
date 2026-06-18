import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, FileText, Award, DollarSign, BrainCircuit, BarChart3, Briefcase, Sun, Moon, Shield } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = user ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cover Letter', path: '/cover-letter', icon: FileText },
    { name: 'AI Insights', path: '/analytics', icon: BrainCircuit },
    { name: 'Security Center', path: '/security', icon: Shield },
    { name: 'Pricing', path: '/pricing', icon: DollarSign },
    ...(user.role === 'admin' ? [{ name: 'Admin Panel', path: '/admin', icon: BarChart3 }] : [])
  ] : [];

  return (
    <div className="flex min-h-screen flex-col bg-dark-900 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-dark-800 bg-dark-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="rounded-lg bg-gradient-to-tr from-brand-600 to-accent-500 p-2 text-white font-bold text-xl shadow-lg shadow-brand-500/20">
              NH
            </span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent logo-text">
              Next<span className="text-brand-500">Hire</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                      : 'text-gray-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="rounded-lg p-2 text-gray-400 hover:bg-dark-800 hover:text-brand-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* User Dropdown/Profile Link */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col text-right mr-1">
                    <span className="text-xs font-semibold text-gray-200">{user.fullName || 'User'}</span>
                    <span className="text-[10px] text-gray-500 capitalize">{user.role}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="rounded-lg p-2.5 text-gray-400 hover:bg-dark-800 hover:text-red-400 transition-colors ml-1"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-all duration-200 shadow-lg shadow-brand-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile actions & menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="rounded-lg p-2 text-gray-400 hover:bg-dark-800 hover:text-brand-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-dark-800 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-b border-dark-800 bg-dark-900 px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'text-gray-300 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-dark-800 mt-4 pt-4 px-3 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-red-400 font-medium text-sm hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-950 py-8 text-center text-sm text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-gradient-to-tr from-brand-600 to-accent-500 px-1.5 py-0.5 text-white font-bold text-xs">
                NH
              </span>
              <span>© 2026 NextHire (operated by Naveen Choudhary). All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/about" className="hover:text-gray-300 transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
              <Link to="/refund" className="hover:text-gray-300 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
