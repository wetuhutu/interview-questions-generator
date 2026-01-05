'use client';

import { useState } from 'react';
import { Question } from '@/types';

interface ResultsSectionProps {
  questions: Question[];
  onDownload: (questions: Question[], format: 'json' | 'csv' | 'text') => void;
  onRegenerate: () => void;
  onShare: (questions: Question[]) => void;
  isLoading: boolean;
}

export default function ResultsSection({ 
  questions, 
  onDownload, 
  onRegenerate, 
  onShare 
}: ResultsSectionProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'text'>('text');
  
  if (questions.length === 0) return null;

  const technicalQuestions = questions.filter(q => q.category === 'technical');
  const behavioralQuestions = questions.filter(q => q.category === 'behavioral');
  const positionRelatedQuestions = questions.filter(q => q.category === 'position-related');

  return (
    <div className="mt-12" id="results-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <i className="fas fa-list mr-2 text-blue-500"></i>
        生成的面试问题
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Questions */}
        {technicalQuestions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
              <i className="fas fa-code mr-2"></i>
              技术问题
            </h3>
            <div className="space-y-4">
              {technicalQuestions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500"
                >
                  <p className="font-medium">{index + 1}. {question.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Behavioral Questions */}
        {behavioralQuestions.length > 0 && (
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
              <i className="fas fa-users mr-2"></i>
              行为问题
            </h3>
            <div className="space-y-4">
              {behavioralQuestions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500"
                >
                  <p className="font-medium">{index + 1}. {question.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Position Related Questions */}
      {positionRelatedQuestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">岗位相关问题</h3>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              {positionRelatedQuestions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500"
                >
                  <p className="font-medium">{index + 1}. {question.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center items-center">
        <div className="flex items-center space-x-2">
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as 'json' | 'csv' | 'text')}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="text">文本格式</option>
            <option value="json">JSON格式</option>
            <option value="csv">CSV格式</option>
          </select>
          <button 
            onClick={() => onDownload(questions, selectedFormat)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            <i className="fas fa-download mr-2"></i>
            下载问题列表
          </button>
        </div>
        <button 
          onClick={onRegenerate}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
        >
          <i className="fas fa-redo mr-2"></i>
          重新生成
        </button>
        <button 
          onClick={() => onShare(questions)}
          className="bg-gray-800 hover:bg-black text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
        >
          <i className="fas fa-share-alt mr-2"></i>
          分享给朋友
        </button>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
        >
          <i className="fas fa-arrow-up mr-2"></i>
          返回顶部
        </button>
      </div>
    </div>
  );
}