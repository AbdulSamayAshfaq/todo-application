
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { authApi, taskApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

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

interface ActivityItem {
  id: number;
  task_title: string;
  action: string;
  timestamp: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    try {
      setError('');
      const fetchedTasks = await taskApi.getTasks();

      setTasks(fetchedTasks);

      // Calculate dashboard metrics
      const today = new Date().toISOString().split('T')[0];
      const overdue = fetchedTasks.filter(
        task =>
          task.due_date &&
          task.due_date.split('T')[0] < today &&
          task.status === 'pending'
      ).length;

      const todayTasks = fetchedTasks.filter(
        task =>
          task.due_date &&
          task.due_date.split('T')[0] === today
      ).length;

      const completed = fetchedTasks.filter(
        task => task.status === 'completed'
      ).length;

      setTodayTasksCount(todayTasks);
      setOverdueTasksCount(overdue);
      setCompletedTasksCount(completed);

      // Get upcoming tasks (next 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const upcoming = fetchedTasks
        .filter(task =>
          task.due_date &&
          task.due_date.split('T')[0] >= today &&
          task.due_date.split('T')[0] <= sevenDaysFromNow.toISOString().split('T')[0] &&
          task.status === 'pending'
        )
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5); // Limit to 5 upcoming tasks

      setUpcomingTasks(upcoming);

      // Simulate recent activity (in a real app, this would come from an API)
      const simulatedActivity: ActivityItem[] = [
        { id: 1, task_title: 'Complete project proposal', action: 'created', timestamp: '2 hours ago' },
        { id: 2, task_title: 'Prepare meeting agenda', action: 'completed', timestamp: '4 hours ago' },
        { id: 3, task_title: 'Update documentation', action: 'updated', timestamp: '1 day ago' },
        { id: 4, task_title: 'Review quarterly reports', action: 'created', timestamp: '2 days ago' },
      ];
      setRecentActivity(simulatedActivity);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    setCompletedTasksCount(prev => newTask.status === 'completed' ? prev + 1 : prev);

    // Update today/overdue counters if needed
    const today = new Date().toISOString().split('T')[0];
    if (newTask.due_date) {
      if (newTask.due_date.split('T')[0] < today && newTask.status === 'pending') {
        setOverdueTasksCount(prev => prev + 1);
      } else if (newTask.due_date.split('T')[0] === today) {
        setTodayTasksCount(prev => prev + 1);
      }
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));

    // Update counters based on new status
    const today = new Date().toISOString().split('T')[0];
    if (updatedTask.status === 'completed') {
      setCompletedTasksCount(prev => prev + 1);
    } else if (updatedTask.status === 'pending') {
      if (updatedTask.due_date) {
        if (updatedTask.due_date.split('T')[0] < today) {
          setOverdueTasksCount(prev => prev + 1);
        } else if (updatedTask.due_date.split('T')[0] === today) {
          setTodayTasksCount(prev => prev + 1);
        }
      }
    }
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
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={fetchData}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-80">Today's Tasks</p>
              <p className="text-2xl font-bold">{todayTasksCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-80">Overdue Tasks</p>
              <p className="text-2xl font-bold">{overdueTasksCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-80">Completed Tasks</p>
              <p className="text-2xl font-bold">{completedTasksCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-400 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-80">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Upcoming Tasks (Next 7 Days)</h3>
            <span className="text-sm text-gray-500">{upcomingTasks.length} tasks</span>
          </div>

          {upcomingTasks.length > 0 ? (
            <div className="space-y-4">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <p className="text-sm text-gray-600">
                      Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      <span className="capitalize">{activity.action}</span> task: <span className="font-semibold">{activity.task_title}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Task Creation and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Task</h3>
          <TaskForm onTaskCreated={handleTaskCreated} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Your Tasks</h3>
            <div className="text-sm text-gray-500">
              {tasks.filter(t => t.status === 'pending').length} pending, {tasks.filter(t => t.status === 'completed').length} completed
            </div>
          </div>

          <TaskList
            tasks={tasks.slice(0, 5)} // Show only first 5 tasks in dashboard
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>
      </div>
    </div>
  );
}
