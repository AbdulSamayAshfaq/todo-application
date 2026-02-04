
'use client';

import { useState, useEffect } from 'react';
import { TaskList } from '../../../app/components/TaskList';
import { TaskForm } from '../../../app/components/TaskForm';
import { useAuth } from '../../../context/AuthContext';
import { taskApi } from '../../../lib/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  owner_id: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTasks();
    }
  }, [isAuthenticated, authLoading]);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await taskApi.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleTaskDeleted = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Task</h2>
        <TaskForm onTaskCreated={handleTaskCreated} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">All Tasks</h3>
        <TaskList
          tasks={tasks}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      </div>
    </div>
  );
}
