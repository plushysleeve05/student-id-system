import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { Eye, CheckCircle, AlertTriangle, Users } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import RecentLogins from "./RecentLogins";
import SecurityAlerts from "./SecurityAlerts";
import Students from "./Students";

function StatCard({ icon: Icon, label, value, percentageChange, color }) {
  const isPositive = percentageChange >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
          <p
            className={`text-sm mt-1 flex items-center space-x-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>{isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(percentageChange)}% from last check</span>
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function calculatePercentageChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalFaces: 0,
    recognizedFaces: 0,
    unrecognizedFaces: 0,
    loginAttempts: 0,
  });

  const [trendData, setTrendData] = useState([]);
  const [previousStats, setPreviousStats] = useState(stats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        const data = await response.json();
        setPreviousStats(stats);
        setStats({
          totalFaces: data.totalFaces,
          recognizedFaces: data.recognizedFaces,
          unrecognizedFaces: data.unrecognizedFaces,
          loginAttempts: data.loginAttempts,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchTrends = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/trends`);
        const data = await response.json();
        console.log("Trend data:", data);
        setTrendData(
          data.map((item) => ({
            date: item.date,
            recognized: item.recognized_faces,
            unrecognized: item.unrecognized_faces,
          }))
        );
      } catch (error) {
        console.error("Error fetching trend data:", error);
      }
    };

    // fetchStats();
    // fetchTrends();

    const interval = setInterval(() => {
      fetchStats();
      fetchTrends();
    }, 10000);

    return () => clearInterval(interval);
  }, [stats]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Eye}
          label="Total Faces Detected"
          value={stats.totalFaces.toLocaleString()}
          percentageChange={calculatePercentageChange(
            stats.totalFaces,
            previousStats.totalFaces
          )}
          color="bg-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Recognized Faces"
          value={stats.recognizedFaces.toLocaleString()}
          percentageChange={calculatePercentageChange(
            stats.recognizedFaces,
            previousStats.recognizedFaces
          )}
          color="bg-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Unrecognized Faces"
          value={stats.unrecognizedFaces.toLocaleString()}
          percentageChange={calculatePercentageChange(
            stats.unrecognizedFaces,
            previousStats.unrecognizedFaces
          )}
          color="bg-red-600"
        />
        <StatCard
          icon={Users}
          label="Total Login Attempts"
          value={stats.loginAttempts.toLocaleString()}
          percentageChange={calculatePercentageChange(
            stats.loginAttempts,
            previousStats.loginAttempts
          )}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold dark:text-white mb-2">
              Face Recognition Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="recognized"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="rgba(34, 197, 94, 0.2)"
                  name="Recognized"
                />
                <Area
                  type="monotone"
                  dataKey="unrecognized"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="rgba(239, 68, 68, 0.2)"
                  name="Unrecognized"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Students />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <SecurityAlerts />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold dark:text-white">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Latest login attempts
              </p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </button>
          </div>
          <RecentLogins />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
