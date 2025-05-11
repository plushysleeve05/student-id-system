import React, { useState, useEffect } from "react";
import { User, Clock, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../config";

function RecentLogins() {
  const [logins, setLogins] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/recent-logins?limit=5`)
      .then((res) => res.json())
      .then((data) => {
        // Convert timestamp to “x mins ago”
        const now = new Date();
        const enriched = data.map((item) => {
          const then = new Date(item.timestamp);
          const diffMs = now - then;
          const diffMins = Math.round(diffMs / 60000);
          return {
            ...item,
            time:
              diffMins < 1
                ? "just now"
                : diffMins < 60
                ? `${diffMins} mins ago`
                : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`,
          };
        });
        setLogins(enriched);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {logins.length > 0 ? (
        logins.map((login) => (
          <div
            key={login.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium dark:text-white truncate">
                  {login.student}
                </p>
                {login.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{login.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{login.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            No Recent Logins
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            New login attempts will appear here
          </p>
        </div>
      )}

      {/* Load More (if you want) */}
      {logins.length >= 5 && (
        <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          Load More
        </button>
      )}
    </div>
  );
}

export default RecentLogins;
