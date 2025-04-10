import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./config";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      const token = fetchToken();
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const initialUserData = {
        id: decoded.sub,
        role: decoded.is_superuser ? "admin" : "user",
      };
      setUser(initialUserData);

      const expiresIn = decoded.exp * 1000 - Date.now();
      if (expiresIn <= 0) {
        logout();
        return;
      }

      const timer = setTimeout(() => {
        logout();
      }, expiresIn);

      fetchUserDetails().then((userData) => {
        if (userData) {
          setUser((prevUser) => ({ ...prevUser, ...userData }));
        }
        setLoading(false);
      });

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        const decoded = jwtDecode(data.access_token);
        const initialUserData = {
          id: decoded.sub,
          role: decoded.is_superuser ? "admin" : "user",
        };

        const userDetails = await fetchUserDetails();
        if (userDetails) {
          setUser({ ...initialUserData, ...userDetails });
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
    <AuthContext.Provider
      value={{ user, login, logout: logoutUser, fetchUserDetails, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const setToken = (token) => {
  try {
    if (!token) throw new Error("No token provided");
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) throw new Error("Invalid token format");

    const tokenData = {
      token,
      timestamp: Date.now(),
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
    if (!tokenData) return null;

    const { token, timestamp } = JSON.parse(tokenData);
    const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000;
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
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.warn(`Logout request failed: ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuth();
    window.location.href = "/";
  }
};

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const isExpValid = decoded.exp > Date.now() / 1000;
    const isFormatValid = decoded.sub && decoded.iat;
    return isExpValid && isFormatValid;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export function RequireAuth({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
