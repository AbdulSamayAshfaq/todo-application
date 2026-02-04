
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { AiAssistantDrawer } from '../../../components/ai/AiAssistantDrawer';
import { taskApi } from '../../../lib/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTasks();
    }
  }, [isAuthenticated, authLoading]);

  const fetchTasks = async () => {
    try {
      setError('');
      const fetchedTasks = await taskApi.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task =>
      task.due_date && task.due_date.split('T')[0] === dateStr
    );
  };

  const getTasksForWeek = (startDate: Date) => {
    const weekTasks = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startDate);
      current.setDate(current.getDate() + i);
      const dateTasks = getTasksForDate(current);
      weekTasks.push({
        date: new Date(current),
        tasks: dateTasks
      });
    }
    return weekTasks;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    const weeks = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(current);
        day.setDate(current.getDate() + i);

        const dayTasks = getTasksForDate(day);

        week.push({
          date: day,
          isCurrentMonth: day.getMonth() === month,
          tasks: dayTasks
        });
      }
      weeks.push(week);
      current.setDate(current.getDate() + 7);
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  return (
                    <td
                      key={dayIndex}
                      className={`border border-gray-200 min-w-[140px] ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                      } ${isToday ? 'bg-blue-50' : ''}`}
                    >
                      <div className="p-2">
                        <div className={`text-right text-sm font-medium ${
                          isToday ? 'text-blue-600 font-bold' : ''
                        }`}>
                          {day.date.getDate()}
                        </div>
                        <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                          {day.tasks.slice(0, 3).map(task => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}
                              onClick={() => navigateToDate(day.date)}
                            >
                              {task.title}
                            </div>
                          ))}
                          {day.tasks.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{day.tasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekData = getTasksForWeek(currentDate);

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {weekData.map(({ date }, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <th key={index} className="px-4 py-2 text-center">
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
                    }`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg ${
                      isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekData.map(({ date, tasks }, index) => (
                <td key={index} className="border border-gray-200 p-4 align-top">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-2 rounded cursor-pointer ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs truncate">{task.description || 'No description'}</div>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
        </div>

        <div className="space-y-4">
          {dayTasks.length > 0 ? (
            dayTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border-l-4 ${
                  task.priority === 'high' ? 'border-red-500 bg-red-50' :
                  task.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{task.title}</h4>
                    <p className="text-gray-600 mt-1">{task.description || 'No description'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No tasks scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => view === 'month' ? changeMonth('prev') : changeWeek('prev')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-medium text-gray-800">{monthYearLabel}</span>
              <button
                onClick={() => view === 'month' ? changeMonth('next') : changeWeek('next')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            {['day', 'week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'month' | 'week' | 'day')}
                className={`px-4 py-2 rounded-lg text-sm ${
                  view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>
      </div>

      <button
        onClick={() => setShowAiAssistant(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      <AiAssistantDrawer
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
      />
    </div>
  );
}
