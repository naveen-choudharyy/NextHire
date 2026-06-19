import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brand-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent-500/5 blur-3xl" />

      <div className="w-full max-w-md space-y-8 glass rounded-2xl p-8 border border-white/5 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-accent-500 p-3 text-white shadow-lg mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to continue building your professional profile
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 flex items-start space-x-2 animate-shake">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-dark-950/50 border border-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-dark-950/50 border border-dark-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500 text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
