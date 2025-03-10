import React from "react";
import { Camera, User, AlertTriangle, CheckCircle } from "lucide-react";

function LiveMonitoring() {
  // Mock data for live monitoring
  const recentEvents = [
    {
      id: 1,
      type: "success",
      name: "John Smith",
      time: "2 mins ago",
      location: "Main Entrance",
    },
    {
      id: 2,
      type: "warning",
      name: "Unknown Person",
      time: "5 mins ago",
      location: "Side Gate",
    },
    {
      id: 3,
      type: "success",
      name: "Sarah Johnson",
      time: "8 mins ago",
      location: "Main Entrance",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Live Monitoring
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time access events</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative mb-6 rounded-lg overflow-hidden bg-gray-900 aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="w-12 h-12 text-gray-600" />
        </div>
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 rounded text-xs text-white flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          LIVE
        </div>
      </div>

      {/* Recent Events */}
      <div className="space-y-4">
        {recentEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
          >
            <div className={`p-2 rounded-full ${
              event.type === "success" 
                ? "bg-green-100 dark:bg-green-900/30" 
                : "bg-yellow-100 dark:bg-yellow-900/30"
            }`}>
              {event.type === "success" ? (
                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate dark:text-white">
                  {event.name}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {event.time}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {event.location}
              </p>
            </div>
            {event.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        View All Events →
      </button>
    </div>
  );
}

export default LiveMonitoring;
