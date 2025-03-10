import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { API_BASE_URL } from './config';

// Create AuthContext
export const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const token = fetchToken();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = fetchToken();
    if (token && isTokenValid(token)) {
      const decoded = jwtDecode(token);
      
      // First set basic user info from token
      const initialUserData = {
        id: decoded.sub,
        role: decoded.is_superuser ? 'admin' : 'user'
      };
      setUser(initialUserData);

      // Then fetch complete user details
      fetchUserDetails().then(userData => {
        if (userData) {
          setUser(prevUser => ({
            ...prevUser,
            ...userData,
          }));
        }
      });
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': username,
          'password': password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        const decoded = jwtDecode(data.access_token);
        
        // Set initial user data from token
        const initialUserData = {
          id: decoded.sub,
          role: decoded.is_superuser ? 'admin' : 'user'
        };
        
        // Fetch complete user details
        const userDetails = await fetchUserDetails();
        if (userDetails) {
          setUser({
            ...initialUserData,
            ...userDetails
          });
        } else {
          setUser(initialUserData);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout: logoutUser,
      fetchUserDetails 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const setToken = (token) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    // Validate token before storing
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token format");
    }
    
    // Store token in localStorage with encryption
    const tokenData = {
      token,
      timestamp: Date.now()
    };
    localStorage.setItem("auth_token", JSON.stringify(tokenData));
    console.log("Token stored successfully");
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
};

export const fetchToken = () => {
  try {
    const tokenData = localStorage.getItem("auth_token");
    if (!tokenData) {
      return null;
    }
    
    const { token, timestamp } = JSON.parse(tokenData);
    
    // Check if token is too old (optional additional security)
    const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - timestamp > MAX_TOKEN_AGE) {
      clearAuth();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem("auth_token");
    console.log("Authentication data cleared");
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
};

export const logout = async () => {
  try {
    console.log("Initiating logout process...");
    const token = fetchToken();
    
    if (token) {
      // Call the backend logout endpoint with token in header
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn(`Logout request failed: ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local auth data
    clearAuth();
    window.location.href = "/";
  }
};

export const isTokenValid = (token) => {
  if (!token) {
    console.log("No token provided");
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Check token expiration
    const isExpValid = decoded.exp > Date.now() / 1000;
    
    // Check token format and required claims
    const isFormatValid = decoded.sub && decoded.iat;
    
    const isValid = isExpValid && isFormatValid;
    console.log("Token validation result:", { isValid, exp: decoded.exp });
    
    return isValid;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export function RequireAuth({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  console.log("Checking authentication for path:", location.pathname);

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log("User authenticated, rendering protected content");
  return children;
}
