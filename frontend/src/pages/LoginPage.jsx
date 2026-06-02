import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- States ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Change Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  // --- Input Validation ---
  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email address is required.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
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
    setSuccess('');

    try {
      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (data.success) {
        setSuccess('Authentication successful! Logging you in...');
        
        // Update Auth Context (persists token and user including role in localStorage)
        login(data.token, data.user);

        // Redirect based strictly on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/opportunities');
          }
        }, 1500);
      } else {
        setApiError(data.message || 'Authentication failed. Please verify credentials.');
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

      {/* Login Card Form */}
      <main id="app-main-content" className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-3xl glass-card animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 id="login-header" className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
              Login to access AIESEC placements
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div id="login-success-banner" className="p-4 mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center space-x-2 animate-bounce">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* API Error Banner */}
          {apiError && (
            <div id="login-error-banner" className="p-4 mb-6 rounded-2xl border border-red-100 bg-red-50 text-red-700 text-sm font-semibold flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label htmlFor="log-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="log-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="saikumar@gmail.com"
                className={`w-full px-4 py-3 rounded-xl border bg-white/60 text-sm font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
                  validationErrors.email ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:border-slate-300'
                }`}
              />
              {validationErrors.email && (
                <p className="text-xs font-semibold text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="log-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="log-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border bg-white/60 text-sm font-semibold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400 ${
                  validationErrors.password ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:border-slate-300'
                }`}
              />
              {validationErrors.password && (
                <p className="text-xs font-semibold text-red-500 mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="log-btn-submit"
              disabled={loading}
              className="w-full py-3 mt-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all duration-200 outline-none flex items-center justify-center space-x-2 active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>

          {/* Link to Register */}
          <div className="text-center mt-6">
            <p className="text-sm font-medium text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" id="link-to-register" className="text-indigo-600 font-bold hover:text-indigo-700 select-none">
                Register
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

export default LoginPage;
