import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bell,
  UserPlus,
  Loader,
  UserCog
} from "lucide-react";
import { logout } from "../Auth";

function Sidebar({ collapsed, toggleSidebar, userRole }) {
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Initiating logout from sidebar...");
      await logout();
      // The logout function in Auth.js will handle the redirection
    } catch (error) {
      console.error("Sidebar logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/students",
      icon: Users,
      label: "Students",
    },
    {
      path: "/enrollment",
      icon: UserPlus,
      label: "Enrollment",
    },
    {
      path: "/live-monitoring",
      icon: Eye,
      label: "Live Monitoring",
    },
    {
      path: "/alerts",
      icon: Bell,
      label: "Security Alerts",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  // Add Admin Management menu item for admin users
  if (userRole === 'admin') {
    menuItems.splice(5, 0, {
      path: "/admin-management",
      icon: UserCog,
      label: "Admin Management",
    });
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-700 transition-all duration-300 z-50 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="h-16 border-b dark:border-gray-700 flex items-center justify-between px-4">
        {!collapsed && <h1 className="text-xl font-bold dark:text-white">Student ID</h1>}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t dark:border-gray-700">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={collapsed ? "Logout" : undefined}
        >
          {isLoggingOut ? (
            <>
              <Loader size={20} className="animate-spin" />
              {!collapsed && <span>Logging out...</span>}
            </>
          ) : (
            <>
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
