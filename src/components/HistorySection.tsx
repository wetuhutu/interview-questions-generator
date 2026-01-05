'use client';

import { useState, useEffect } from 'react';
import { getHistory, removeFromHistory, clearHistory, HistoryItem } from '@/utils/localStorage';
import { Question } from '@/types';

interface HistorySectionProps {
  onSelectHistoryItem: (questions: Question[]) => void;
}

export default function HistorySection({ onSelectHistoryItem }: HistorySectionProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    setHistory(getHistory());
  };

  const handleLoad = (questions: Question[]) => {
    onSelectHistoryItem(questions);
    setShowHistory(false);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <button 
        onClick={() => setShowHistory(!showHistory)}
        className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
      >
        <i className={`fas mr-2 ${showHistory ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        {showHistory ? '隐藏历史记录' : '查看历史记录'}
      </button>
      
      {showHistory && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">历史生成记录</h3>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('确定要清除所有历史记录吗？此操作无法撤销。')) {
                    clearHistory();
                    setHistory([]);
                  }
                }}
                className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors"
              >
                清除全部
              </button>
            )}
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无历史记录</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{item.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{item.companyName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString('zh-CN')}
                      </p>
                      {item.resumePreview && (
                        <p className="text-sm text-gray-500 mt-2 truncate">简历: {item.resumePreview}{item.resumePreview.length > 100 ? '...' : ''}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleLoad(item.questions)}
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-3 rounded transition-colors"
                      >
                        加载
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}