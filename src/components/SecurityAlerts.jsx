import React, { useState } from "react";
import { Shield, AlertTriangle, Info, Bell, X } from "lucide-react";

function SecurityAlerts() {
  // 1) Dummy alerts with type-specific extra fields
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "high",
      message: "Unauthorized access attempt detected",
      time: "2 mins ago",
      full_timestamp: "2025-04-25 02:02:23",
      location: "Main Entrance",
      student_id: "S1234567",
      image_url: "https://via.placeholder.com/150",
      camera_id: "Camera A",
    },
    {
      id: 2,
      type: "medium",
      message: "Multiple failed recognition attempts",
      time: "15 mins ago",
      full_timestamp: "2025-04-25 01:47:12",
      location: "Side Gate",
      failedAttempts: 5,
      lastAttemptTime: "2025-04-25 01:46:50",
      operator: "facial-recog-service-1",
    },
    {
      id: 3,
      type: "low",
      message: "System update available",
      time: "1 hour ago",
      full_timestamp: "2025-04-25 01:00:00",
      location: "System",
      version: "v2.3.4",
      releaseNotesUrl: "https://example.com/release-notes/v2.3.4",
    },
  ]);

  // 2) Which alert is open?
  const [selected, setSelected] = useState(null);

  // 3) Dismiss & acknowledge
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };
  const acknowledgeAlert = (id) => {
    // stub: just remove it for now
    dismissAlert(id);
  };

  // styling helpers...
  const getAlertStyles = (type) => {
    switch (type) {
      case "high":
        return {
          container:
            "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 hover:bg-red-100/50 cursor-pointer",
          icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        };
      case "medium":
        return {
          container:
            "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30 hover:bg-yellow-100/50 cursor-pointer",
          icon: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
        };
      case "low":
        return {
          container:
            "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100/50 cursor-pointer",
          icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        };
      default:
        return {
          container:
            "bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-900/30 hover:bg-gray-100/50 cursor-pointer",
          icon: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
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
    <>
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
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {alerts.length} Active
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const styles = getAlertStyles(alert.type);
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`relative p-4 rounded-lg border ${styles.container}`}
                onClick={() => setSelected(alert)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${styles.icon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium dark:text-white">
                        {alert.message}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
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
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No active alerts
          </p>
        )}
      </div>

      {/* View All Link */}
      <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        View All Alerts →
      </button>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden w-11/12 max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">
                Alert Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Shared info */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="font-medium dark:text-gray-300">Type</dt>
                <dd className="dark:text-white">{selected.type}</dd>
                <dt className="font-medium dark:text-gray-300">When</dt>
                <dd className="dark:text-white">{selected.full_timestamp}</dd>
                <dt className="font-medium dark:text-gray-300">Location</dt>
                <dd className="dark:text-white">{selected.location}</dd>
                <dt className="font-medium dark:text-gray-300">Message</dt>
                <dd className="dark:text-white">{selected.message}</dd>
              </dl>

              {/* Type-specific details */}
              {selected.type === "high" && (
                <>
                  <div className="flex justify-center">
                    <img
                      src={selected.image_url}
                      alt={`Student ${selected.student_id}`}
                      className="h-32 w-32 rounded-full object-cover border"
                    />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="font-medium dark:text-gray-300">
                      Student ID
                    </dt>
                    <dd className="dark:text-white">{selected.student_id}</dd>
                    <dt className="font-medium dark:text-gray-300">Camera</dt>
                    <dd className="dark:text-white">{selected.camera_id}</dd>
                  </dl>
                </>
              )}

              {selected.type === "medium" && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="font-medium dark:text-gray-300">Attempts</dt>
                  <dd className="dark:text-white">{selected.failedAttempts}</dd>
                  <dt className="font-medium dark:text-gray-300">
                    Last Attempt
                  </dt>
                  <dd className="dark:text-white">
                    {selected.lastAttemptTime}
                  </dd>
                  <dt className="font-medium dark:text-gray-300">Operator</dt>
                  <dd className="dark:text-white">{selected.operator}</dd>
                </dl>
              )}

              {selected.type === "low" && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="font-medium dark:text-gray-300">Version</dt>
                  <dd className="dark:text-white">{selected.version}</dd>
                  <dt className="font-medium dark:text-gray-300">
                    Release Notes
                  </dt>
                  <dd className="dark:text-white">
                    <a
                      href={selected.releaseNotesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Notes
                    </a>
                  </dd>
                </dl>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => dismissAlert(selected.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => acknowledgeAlert(selected.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SecurityAlerts;
