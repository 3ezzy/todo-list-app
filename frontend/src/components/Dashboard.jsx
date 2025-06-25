import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { 
  PlusIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      apiService.updateToken(); // Ensure fresh token
      const data = await apiService.getTasks();
      setTasks(data);
      setError('');
    } catch (error) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await apiService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
      return { success: true };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const updatedTask = await apiService.updateTask(id, taskData);
      setTasks(prev =>
        prev.map(task => (task.id === id ? updatedTask : task))
      );
      setEditingTask(null);
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  };

  // FIXED: Removed window.confirm() - let TaskList handle confirmation
  const handleDeleteTask = async (id) => {
    try {
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updatedTask = await apiService.toggleTask(id);
      setTasks(prev =>
        prev.map(task => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10" />
      
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                <p className="text-sm text-gray-600">{getGreeting()}, {user?.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <UserCircleIcon className="h-5 w-5" />
                <span>{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white/50 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Tasks Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span>All your tasks in one place</span>
              </div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingTasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span>Tasks waiting to be completed</span>
              </div>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span>{completionRate}% completion rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-sm font-medium text-gray-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {completedTasks.length} of {totalTasks} tasks completed
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Tasks</h2>
            <p className="text-gray-600">Manage and track your daily tasks</p>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Task
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your tasks...</p>
            </div>
          </div>
        ) : totalTasks === 0 ? (
          /* Empty State */
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-12">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first task!</p>
              <button
                onClick={() => setShowTaskForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Task
              </button>
            </div>
          </div>
        ) : (
          /* Task List */
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            <TaskList
              tasks={tasks}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onToggle={handleToggleTask}
            />
          </div>
        )}
      </main>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask.id, data) : 
            handleCreateTask
          }
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;