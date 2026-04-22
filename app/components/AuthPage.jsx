'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Instagram, 
  Facebook,
  Chrome,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        // Simulate successful login
        onLogin({
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          avatar: null
        });
      } else {
        // Simulate successful signup
        setSuccess('Account created successfully! Please login.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    // Simulate social login
    setTimeout(() => {
      setLoading(false);
      onLogin({
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        avatar: null
      });
    }, 1000);
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left animate-slide-up">
          <div className="inline-block mb-6 p-4 bg-gradient-primary rounded-2xl shadow-xl">
            <Instagram className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-dark-900 mb-4">
            Welcome to <span className="gradient-primary bg-clip-text text-transparent">InstaHub</span>
          </h1>
          <p className="text-xl text-dark-600 mb-8 leading-relaxed">
            Connect your Instagram and WhatsApp accounts to manage all your social conversations in one powerful dashboard.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-dark-900">Unified Messaging</h3>
                <p className="text-dark-600">Manage Instagram DMs and WhatsApp chats in one place</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-dark-900">Smart Automation</h3>
                <p className="text-dark-600">Set up auto-replies and chatbots for instant responses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-dark-900">Real-time Analytics</h3>
                <p className="text-dark-600">Track engagement, response times, and user metrics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-dark-100">
            {/* Toggle Login/Signup */}
            <div className="flex space-x-2 mb-8 bg-dark-50 p-1 rounded-lg">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isLogin 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-dark-600 hover:text-dark-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-dark-600 hover:text-dark-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-slide-down">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 animate-slide-down">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-11 pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-dark-600">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-dark-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Instagram')}
                  disabled={loading}
                  className="btn-secondary py-3 flex items-center justify-center space-x-2"
                >
                  <Instagram className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={loading}
                  className="btn-secondary py-3 flex items-center justify-center space-x-2"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={loading}
                  className="btn-secondary py-3 flex items-center justify-center space-x-2"
                >
                  <Chrome className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-dark-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
