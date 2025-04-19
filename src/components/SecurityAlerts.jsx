import React, { useState } from "react";
import { Shield, AlertTriangle, Info, Bell, X } from "lucide-react";

function SecurityAlerts() {
  // 1) Initialize state from your mock data
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "high",
      message: "Unauthorized access attempt detected",
      time: "2 mins ago",
      location: "Main Entrance",
    },
    {
      id: 2,
      type: "medium",
      message: "Multiple failed recognition attempts",
      time: "15 mins ago",
      location: "Side Gate",
    },
    {
      id: 3,
      type: "low",
      message: "System update available",
      time: "1 hour ago",
      location: "System",
    },
  ]);

  // 2) Dismiss handler: remove an alert by id
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case "high":
        return {
          container: "bg-red-50 dark:bg-red-900/20",
          icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
          border: "border-red-100 dark:border-red-900/30",
        };
      case "medium":
        return {
          container: "bg-yellow-50 dark:bg-yellow-900/20",
          icon: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
          border: "border-yellow-100 dark:border-yellow-900/30",
        };
      case "low":
        return {
          container: "bg-blue-50 dark:bg-blue-900/20",
          icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          border: "border-blue-100 dark:border-blue-900/30",
        };
      default:
        return {
          container: "bg-gray-50 dark:bg-gray-900/20",
          icon: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
          border: "border-gray-100 dark:border-gray-900/30",
        };
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "high":
        return AlertTriangle;
      case "medium":
        return Bell;
      case "low":
        return Info;
      default:
        return Shield;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Security Alerts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Recent security notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {alerts.length} Active
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.type);
          const AlertIcon = getAlertIcon(alert.type);

          return (
            <div
              key={alert.id}
              className={`relative p-4 rounded-lg border ${styles.container} ${styles.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${styles.icon}`}>
                  <AlertIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium dark:text-white">
                      {alert.message}
                    </p>
                    {/* 3) Wire up dismiss */}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>{alert.location}</span>
                    <span>•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No active alerts
          </p>
        )}
      </div>

      {/* View All Link */}
      <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        View All Alerts →
      </button>
    </div>
  );
}

export default SecurityAlerts;
