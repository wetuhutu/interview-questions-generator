'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { ResumeData, JobDetails, GenerationConfig } from '@/types';

interface InputSectionProps {
  resumeData: ResumeData;
  jobDetails: JobDetails;
  onResumeChange: (data: ResumeData) => void;
  onJobDetailsChange: (details: JobDetails) => void;
  onGenerate: (config: GenerationConfig) => void;
  isLoading: boolean;
  progress: number;
}

export default function InputSection({ 
  resumeData, 
  jobDetails, 
  onResumeChange, 
  onJobDetailsChange, 
  onGenerate,
  isLoading,
  progress
}: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GenerationConfig>({
    questionCount: 8,
    questionTypes: ['technical', 'behavioral', 'position-related'],
    difficultyLevel: 'mid',
    includeTechnical: true,
    includeBehavioral: true,
    includePositionRelated: true,
  });

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null); // 清除之前的错误
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
          setError('文件大小不能超过10MB');
          return;
        }
        onResumeChange({ ...resumeData, file });
      } else {
        setError('请上传PDF或DOCX格式的简历');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null); // 清除之前的错误
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
          setError('文件大小不能超过10MB');
          return;
        }
        onResumeChange({ ...resumeData, file });
      } else {
        setError('请上传PDF或DOCX格式的简历');
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onResumeChange({ ...resumeData, text: e.target.value });
  };

  const handleJobDetailsChange = (field: keyof JobDetails, value: string) => {
    onJobDetailsChange({ ...jobDetails, [field]: value });
  };

  const handleConfigChange = (field: keyof GenerationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionTypeChange = (type: 'includeTechnical' | 'includeBehavioral' | 'includePositionRelated') => {
    setConfig(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleGenerate = () => {
    if (!resumeData.file && !resumeData.text) {
      alert('请上传简历或粘贴简历文本');
      return;
    }
    
    if (!jobDetails.title || !jobDetails.description) {
      alert('请填写职位名称和职位描述');
      return;
    }
    
    onGenerate(config);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Resume Upload Section */}
      <div className="space-y-6 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-file-upload mr-2 text-blue-500"></i>
          上传简历
        </h2>
        
        {/* File Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-500'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 mb-2">点击或拖拽PDF/DOCX文件到此处</p>
          <p className="text-sm text-gray-500">支持PDF和DOCX格式，文件大小不超过10MB</p>
          
          {resumeData.file ? (
            <div className="mt-4">
              <i className="fas fa-file-pdf text-4xl text-red-500 mb-4"></i>
              <p className="text-gray-600 mb-2">{resumeData.file.name}</p>
              <p className="text-sm text-gray-500">点击重新选择</p>
            </div>
          ) : (
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              选择文件
            </button>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx" 
            onChange={handleFileUpload} 
          />
        </div>
        
        {/* Text Input Option */}
        <div className="mt-4 flex-grow flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            或粘贴简历文本
          </label>
          <textarea
            value={resumeData.text || ''}
            onChange={handleTextChange}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-grow"
            placeholder="粘贴您的简历文本内容..."
          />
        </div>
      </div>

      {/* Job Description and Configuration Section */}
      <div className="space-y-6 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-briefcase mr-2 text-blue-500"></i>
          职位要求与配置
        </h2>
        
        <div className="space-y-4 flex-grow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              职位名称
            </label>
            <input
              type="text"
              value={jobDetails.title}
              onChange={(e) => handleJobDetailsChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：前端开发工程师"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公司名称
            </label>
            <input
              type="text"
              value={jobDetails.company}
              onChange={(e) => handleJobDetailsChange('company', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：ABC科技有限公司"
            />
          </div>
          
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              职位描述
            </label>
            <textarea
              value={jobDetails.description}
              onChange={(e) => handleJobDetailsChange('description', e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="粘贴职位描述..."
            />
          </div>
          
          {/* Generation Configuration */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">生成配置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  问题数量: {config.questionCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={config.questionCount}
                  onChange={(e) => handleConfigChange('questionCount', parseInt(e.target.value))}
                  className="w-full"
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>3</span>
                  <span>20</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  难度级别
                </label>
                <select
                  value={config.difficultyLevel}
                  onChange={(e) => handleConfigChange('difficultyLevel', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                >
                  <option value="junior">初级</option>
                  <option value="mid">中级</option>
                  <option value="senior">高级</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                问题类型
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeTechnical}
                    onChange={() => handleQuestionTypeChange('includeTechnical')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span>技术问题</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeBehavioral}
                    onChange={() => handleQuestionTypeChange('includeBehavioral')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span>行为问题</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includePositionRelated}
                    onChange={() => handleQuestionTypeChange('includePositionRelated')}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span>岗位相关</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}
      
      {/* Progress Bar */}
      {isLoading && (
        <div className="mt-4 w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">{progress}%</p>
        </div>
      )}
      
      {/* Generate and Clear Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 lg:col-span-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg hover:shadow-xl`}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              生成中... ({progress}%)
            </>
          ) : (
            <>
              <i className="fas fa-bolt mr-2"></i>
              生成面试问题
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            onResumeChange({});
            onJobDetailsChange({ title: '', company: '', description: '' });
            setError(null);
          }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full text-lg transition-colors shadow"
        >
          <i className="fas fa-eraser mr-2"></i>
          清除输入
        </button>
      </div>
    </div>
  );
}