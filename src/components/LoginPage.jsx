import React from "react";
import LoginForm from "./LoginForm";
import { Shield } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl flex overflow-hidden w-full max-w-[1100px]">
        {/* Left side with illustration */}
        <div className="hidden md:flex w-1/2 bg-blue-600 p-12 items-center justify-center relative overflow-hidden">
          <div className="relative z-10 text-white max-w-md">
            <div className="flex items-center gap-2 mb-8">
              <Shield className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Student ID System</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Welcome to the Face Recognition System
            </h2>
            <p className="text-blue-100 mb-8">
              Secure and efficient student identification using advanced face recognition technology.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Enhanced Security</h3>
                  <p className="text-sm text-blue-100">
                    Advanced face recognition for secure access
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Real-time Monitoring</h3>
                  <p className="text-sm text-blue-100">
                    Instant verification and tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Easy Management</h3>
                  <p className="text-sm text-blue-100">
                    Simplified student data management
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="absolute inset-0 bg-blue-600 opacity-50 mix-blend-multiply"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
        </div>

        {/* Right side with login form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Student ID System</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
