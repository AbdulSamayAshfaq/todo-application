
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { AiAssistantDrawer } from '../../../components/ai/AiAssistantDrawer';

interface HistoryItem {
  id: number;
  task_title: string;
  action: string;
  created_at: string;
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchHistory();
    }
  }, [isAuthenticated, authLoading]);

  const fetchHistory = async () => {
    const mockHistory: HistoryItem[] = [
      { id: 1, task_title: 'Complete project proposal', action: 'created', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, task_title: 'Prepare meeting agenda', action: 'completed', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { id: 3, task_title: 'Update documentation', action: 'updated', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { id: 4, task_title: 'Review quarterly reports', action: 'created', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ];
    setHistoryItems(mockHistory);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity History</h2>
        
        <div className="space-y-4">
          {historyItems.map(item => (
            <div key={item.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className={`px-3 py-1 rounded-full text-sm ${getActionColor(item.action)}`}>
                {item.action}
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-800">{item.task_title}</p>
                <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
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
