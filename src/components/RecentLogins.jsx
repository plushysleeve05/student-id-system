import React from "react";
import { User, Clock, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

function RecentLogins() {
  // Mock data for recent logins
  const logins = [
    {
      id: 1,
      name: "John Smith",
      time: "2 mins ago",
      location: "Main Entrance",
      status: "success",
      image: null,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      time: "15 mins ago",
      location: "Side Gate",
      status: "success",
      image: null,
    },
    {
      id: 3,
      name: "Unknown Person",
      time: "20 mins ago",
      location: "Back Entrance",
      status: "failed",
      image: null,
    },
    {
      id: 4,
      name: "Michael Brown",
      time: "45 mins ago",
      location: "Main Entrance",
      status: "success",
      image: null,
    },
    {
      id: 5,
      name: "Emily Davis",
      time: "1 hour ago",
      location: "Side Gate",
      status: "success",
      image: null,
    },
  ];

  return (
    <div className="space-y-4">
      {logins.map((login) => (
        <div
          key={login.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {login.image ? (
              <img
                src={login.image}
                alt={login.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>

          {/* Login Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium dark:text-white truncate">
                {login.name}
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
      ))}

      {/* Load More Button */}
      <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
        Load More
      </button>

      {/* No Logins State */}
      {logins.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Recent Logins</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            New login attempts will appear here
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentLogins;
