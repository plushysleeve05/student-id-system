import React from "react";
import { Eye, CheckCircle, AlertTriangle, Users, Clock, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import RecentLogins from "./RecentLogins";
import LiveMonitoring from "./LiveMonitoring";
import SecurityAlerts from "./SecurityAlerts";

// Mock Data for Charts
const loginData = [
  { day: "Mon", recognized: 120, unrecognized: 5 },
  { day: "Tue", recognized: 98, unrecognized: 8 },
  { day: "Wed", recognized: 150, unrecognized: 12 },
  { day: "Thu", recognized: 130, unrecognized: 15 },
  { day: "Fri", recognized: 160, unrecognized: 7 },
  { day: "Sat", recognized: 170, unrecognized: 9 },
  { day: "Sun", recognized: 180, unrecognized: 6 },
];

// Reusable Stat Card Component
function StatCard({ icon: Icon, label, value, change, color }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
          <p className={`text-sm mt-1 flex items-center space-x-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(change)}% from last week</span>
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Graph Component
function LoginTrendsGraph() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold dark:text-white">Face Recognition Trends</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days activity</p>
        </div>
        <select className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm border-0">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={loginData}>
          <defs>
            <linearGradient id="colorRecognized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorUnrecognized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="day" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="recognized"
            stroke="#22C55E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRecognized)"
            name="Recognized"
          />
          <Area
            type="monotone"
            dataKey="unrecognized"
            stroke="#EF4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUnrecognized)"
            name="Unrecognized"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Eye}
          label="Total Faces Detected"
          value="2,750"
          change={4.2}
          color="bg-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Recognized Faces"
          value="2,490"
          change={3.1}
          color="bg-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Unrecognized Faces"
          value="260"
          change={-1.8}
          color="bg-red-600"
        />
        <StatCard
          icon={Users}
          label="Total Login Attempts"
          value="3,012"
          change={8.5}
          color="bg-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <LoginTrendsGraph />
          
          {/* Live Monitoring & Security Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <LiveMonitoring />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <SecurityAlerts />
            </div>
          </div>
        </div>

        {/* Recent Activity Section - Takes up 1 column */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Recent Activity</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest login attempts</p>
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
