import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LockClosedIcon,
  ChartBarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  useEffect(() => {
    if (loading) {
      const stages = [
        { progress: 20, message: 'Verifying credentials...' },
        { progress: 40, message: 'Checking permissions...' },
        { progress: 60, message: 'Loading user data...' },
        { progress: 80, message: 'Preparing dashboard...' },
        { progress: 100, message: 'Almost ready!' }
      ];

      let currentStage = 0;
      const interval = setInterval(() => {
        if (currentStage < stages.length) {
          setLoadingProgress(stages[currentStage].progress);
          setLoadingStage(stages[currentStage].message);
          currentStage++;
        } else {
          clearInterval(interval);
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="relative">
          {/* Main Loading Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 max-w-md mx-auto">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse">
                <LockClosedIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Task Manager
              </h2>
              <p className="text-gray-600">
                Securing your workspace...
              </p>
            </div>

            {/* Loading Animation */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {/* Outer Ring */}
                  <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                  
                  {/* Animated Ring */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-cyan-600 rounded-full animate-spin"></div>
                  
                  {/* Inner Circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>

              {/* Loading Text */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {loadingStage}
                </p>
                <p className="text-xs text-gray-500">
                  {loadingProgress}% complete
                </p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="h-4 w-4 text-blue-600" />
                </div>
                <span>Task management & tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                </div>
                <span>Progress monitoring</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex-shrink-0 w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center">
                  <LockClosedIcon className="h-4 w-4 text-cyan-600" />
                </div>
                <span>Secure data protection</span>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-cyan-400 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 -right-8 w-4 h-4 bg-blue-300 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-500">
            Welcome back, we're preparing everything for you...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;