import React, { useState, useEffect, useLayoutEffect, useContext } from "react";
import { AuthContext, RequireAuth } from "./Auth";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Settings from "./components/SettingsPage";
import Students from "./components/Students";
import StudentEnrollment from "./components/StudentEnrollment";
import SecurityAlerts from "./components/SecurityAlerts";
import LiveMonitoring from "./components/LiveMonitoring";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
// import SuperAdminRegistrationPage from "./components/SuperAdminRegistrationPage";
import AdminManagement from "./components/AdminManagement";

function ProtectedAdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

function Layout({ children }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Hide Sidebar & Navbar on Login Page
  const isLoginPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white flex">
      {!isLoginPage && (
        <Sidebar
          collapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          userRole={user?.role}
        />
      )}
      <div
        className={`transition-all duration-300 flex-1 ${
          !isLoginPage && (sidebarCollapsed ? "ml-16" : "ml-64")
        }`}
      >
        {!isLoginPage && (
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        )}
        <main className="p-4">
          {React.cloneElement(children, { darkMode, toggleDarkMode })}
        </main>
      </div>
    </div>
  );
}

function App() {
  // Initialize theme from localStorage on app load
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected Routes */}
        <Route
          path="/admin-management"
          element={
            <RequireAuth>
              <ProtectedAdminRoute>
                <Layout>
                  <AdminManagement />
                </Layout>
              </ProtectedAdminRoute>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route
          path="/students"
          element={
            <Layout>
              <Students />
            </Layout>
          }
        />
        <Route
          path="/enrollment"
          element={
            <Layout>
              <StudentEnrollment />
            </Layout>
          }
        />
        <Route
          path="/alerts"
          element={
            <Layout>
              <SecurityAlerts />
            </Layout>
          }
        />
        <Route
          path="/live-monitoring"
          element={
            <Layout>
              <LiveMonitoring />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
