import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/api';

function RegisterPage() {
  const navigate = useNavigate();

  // --- States ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Change Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clean specific field error when typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  // --- Field Validation ---
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    if (!formData.email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please provide a valid email format.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const data = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (data.success) {
        setSuccessMessage('Registration successful! Redirecting you to login...');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        // Redirect to login after 2.5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setApiError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError('Unable to connect to service. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Header section (Minimal & branding) */}
      <header id="app-header" className="sticky top-0 z-40 w-full glass-panel shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 select-none">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg tracking-tighter">
              A
            </div>
            <span className="font-bold text-slate-800 text-base tracking-wide uppercase">
              AIESEC <span className="text-indigo-600 font-extrabold">Amaravati</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Form Area */}
      <main id="app-main-content" className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-3xl glass-card animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 id="register-header" className="text-2xl font-black text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
              Empower your global career today
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div id="register-success-banner" className="p-4 mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* API Error Banner */}
          {apiError && (
            <div id="register-error-banner" className="p-4 mb-6 rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Form Element */}
          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="reg-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sai Kumar"
                className={`w-full px-4 py-3 rounded-xl border bg-white/60 text-sm font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
                  validationErrors.name ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:border-slate-300'
                }`}
              />
              {validationErrors.name && (
                <p id="error-name" className="text-xs font-semibold text-red-500 mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="saikumar@gmail.com"
                className={`w-full px-4 py-3 rounded-xl border bg-white/60 text-sm font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
                  validationErrors.email ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:border-slate-300'
                }`}
              />
              {validationErrors.email && (
                <p id="error-email" className="text-xs font-semibold text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border bg-white/60 text-sm font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
                  validationErrors.password ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:border-slate-300'
                }`}
              />
              {validationErrors.password && (
                <p id="error-password" className="text-xs font-semibold text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                id="reg-confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border bg-white/60 text-sm font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
                  validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:border-slate-300'
                }`}
              />
              {validationErrors.confirmPassword && (
                <p id="error-confirmPassword" className="text-xs font-semibold text-red-500 mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="reg-btn-submit"
              disabled={loading}
              className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all duration-200 outline-none flex items-center justify-center space-x-2 active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Redirect to Login */}
          <div className="text-center mt-6">
            <p className="text-sm font-medium text-slate-400">
              Already have an account?{' '}
              <Link to="/login" id="link-to-login" className="text-indigo-600 font-bold hover:text-indigo-700 select-none">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="app-footer" className="w-full bg-white border-t border-slate-100 py-6 select-none">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            © {new Date().getFullYear()} AIESEC in Amaravati. Empowering Leadership.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default RegisterPage;
