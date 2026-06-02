import React, { createContext, useContext, useState, useEffect } from 'react';

// Create global authentication context
const AuthContext = createContext(null);

/**
 * Authentication Context State Provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check persistent storage on boot
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('❌ Failed parsing persistent user storage:', error);
        // Clear corrupt storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Log the user session in and persist state
   * @param {string} sessionToken - JWT signed token
   * @param {Object} sessionUser - User data including name, email, role
   */
  const login = (sessionToken, sessionUser) => {
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  /**
   * Log the active user out and purge all persistent variables
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily consume authentication contexts
 * @returns {Object} Auth state context elements
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider context wrapper.');
  }
  return context;
};
