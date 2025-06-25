import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckIcon,
  PencilSquareIcon, 
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DeleteConfirmationModal = ({ isOpen, task, onConfirm, onCancel }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 z-10 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-90 opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Task</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this task? This action is permanent and cannot be undone.
            </p>
            
            {/* Task Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400 mb-6">
              <h4 className="font-semibold text-gray-900 mb-1">{task?.title}</h4>
              {task?.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}
              <div className="flex items-center space-x-3 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${
                  task?.completed 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {task?.completed ? 'Completed' : 'Pending'}
                </span>
                <span className="text-gray-500">
                  Created {task?.created_at ? new Date(task.created_at).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal at document root using portal
  return createPortal(modalContent, document.body);
};

const TaskList = ({ tasks, onEdit, onDelete, onToggle }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });

  const handleDeleteClick = (task) => {
    setDeleteModal({ isOpen: true, task });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.task) {
      onDelete(deleteModal.task.id);
    }
    setDeleteModal({ isOpen: false, task: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, task: null });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ClockIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-500">Create your first task to get started</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const TaskItem = ({ task }) => (
    <div 
      className={`group relative border-l-4 pl-6 py-4 transition-all duration-300 ${
        task.completed 
          ? 'border-l-green-400 bg-green-50/30 hover:bg-green-50/50' 
          : 'border-l-blue-400 bg-white hover:bg-blue-50/30 hover:border-l-blue-500'
      }`}
      onMouseEnter={() => setHoveredTask(task.id)}
      onMouseLeave={() => setHoveredTask(null)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className={`relative mt-0.5 h-5 w-5 rounded-full border transition-all duration-200 flex items-center justify-center ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white scale-110'
                : 'border-gray-300 hover:border-blue-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {task.completed && <CheckIcon className="h-3 w-3 font-bold" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-medium leading-tight mb-1 transition-all duration-200 ${
              task.completed 
                ? 'text-gray-600 line-through opacity-75' 
                : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm leading-relaxed mb-3 ${
                task.completed 
                  ? 'text-gray-500 line-through opacity-60' 
                  : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Created {formatDate(task.created_at)}</span>
              {task.completed && task.updated_at && (
                <span className="text-green-600">
                  • Completed {formatDate(task.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center space-x-1 transition-all duration-200 ${
          hoveredTask === task.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
            title="Edit task"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(task)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
            title="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-200">
            <ClockIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Pending</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {pendingTasks.length}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {pendingTasks.map((task, index) => (
              <div key={task.id}>
                <TaskItem task={task} />
                {index < pendingTasks.length - 1 && (
                  <div className="border-b border-gray-100 ml-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-200">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {completedTasks.length}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {completedTasks.map((task, index) => (
              <div key={task.id}>
                <TaskItem task={task} />
                {index < completedTasks.length - 1 && (
                  <div className="border-b border-gray-100 ml-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        task={deleteModal.task}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default TaskList;