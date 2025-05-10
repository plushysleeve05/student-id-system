// src/components/SecurityAlerts.jsx

import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Info, Bell, X } from "lucide-react";
import { API_BASE_URL } from "../config";

// helper: turn "full_timestamp" or "studentId" into "Full Timestamp" / "Student Id"
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1") // split camelCase
    .replace(/[_-]/g, " ") // split snake_case / kebab-case
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function SecurityAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);

  // ─── Fetch existing alerts on mount ──────────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/security-alerts`)
      .then((res) => res.json())
      .then(setAlerts)
      .catch((err) => console.error("Fetch alerts failed", err));
  }, []);

  // ─── Subscribe to WS for new alerts ─────────────────────
  useEffect(() => {
    const ws = new WebSocket(API_BASE_URL.replace(/^http/, "ws") + "/ws");

    ws.onopen = () => console.log("Alerts WS connected");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.id) {
        setAlerts((prev) => [data, ...prev]);
      }
    };
    ws.onerror = (err) => console.error("Alerts WS error", err);
    ws.onclose = () => console.log("Alerts WS closed");

    return () => ws.close();
  }, []);

  // ─── Dismiss / acknowledge helpers ─────────────────────
  const dismissAlert = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/security-alerts/${id}`, {
        method: "DELETE",
      });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error("Dismiss failed", err);
    }
  };
  const acknowledgeAlert = (id) => dismissAlert(id);

  // ─── Styling helpers ────────────────────────────────────
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
      case "success":
        return {
          container:
            "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 hover:bg-green-100/50 cursor-pointer",
          icon: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        };
      case "warning":
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
      case "success":
        return Bell;
      case "warning":
        return AlertTriangle;
      case "low":
        return Info;
      default:
        return Shield;
    }
  };

  // ─── Render ─────────────────────────────────────────────
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
        {alerts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No active alerts
          </p>
        ) : (
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
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">
                Alert #{selected.id} Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {/* Shared fields */}
                <dt className="font-medium dark:text-gray-300">Type</dt>
                <dd className="dark:text-white">{selected.type}</dd>
                <dt className="font-medium dark:text-gray-300">When</dt>
                <dd className="dark:text-white">{selected.time}</dd>
                <dt className="font-medium dark:text-gray-300">Location</dt>
                <dd className="dark:text-white">{selected.location}</dd>
                <dt className="font-medium dark:text-gray-300">Message</dt>
                <dd className="dark:text-white">{selected.message}</dd>

                {/* Dynamically render any extra keys */}
                {Object.entries(selected)
                  .filter(
                    ([key]) =>
                      !["id", "type", "time", "location", "message"].includes(
                        key
                      )
                  )
                  .map(([key, value]) => (
                    <React.Fragment key={key}>
                      <dt className="font-medium dark:text-gray-300">
                        {formatKey(key)}
                      </dt>
                      <dd className="dark:text-white">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </dd>
                    </React.Fragment>
                  ))}
              </dl>

              {/* Modal Actions */}
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
