import { useState } from 'react';
import { ResumeData, JobDetails, Question, GenerationConfig } from '@/types';
import { saveToHistory, getHistory, removeFromHistory, clearHistory, HistoryItem } from '@/utils/localStorage';
import { parseResumeDocument } from '@/utils/documentParser';
import { generateQuestionsWithAI, GenerationConfig as AIConfig } from '@/services/aiService';
import { exportAsJSON, exportAsCSV, exportAsText, downloadFile } from '@/utils/exportUtils';

export const useQuestionsGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 默认配置
  const defaultConfig: GenerationConfig = {
    questionCount: 8,
    questionTypes: ['technical', 'behavioral', 'position-related'],
    difficultyLevel: 'mid',
    includeTechnical: true,
    includeBehavioral: true,
    includePositionRelated: true,
  };

  const generateQuestions = async (
    resumeData: ResumeData, 
    jobDetails: JobDetails,
    config: GenerationConfig = defaultConfig
  ): Promise<Question[]> => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      // 1. 解析简历文档
      setProgress(20);
      const resumeText = await parseResumeDocument(resumeData);
      
      // 2. 更新进度
      setProgress(40);
      
      // 3. 准备问题类型
      const questionTypes: ('technical' | 'behavioral' | 'position-related')[] = [];
      if (config.includeTechnical) questionTypes.push('technical');
      if (config.includeBehavioral) questionTypes.push('behavioral');
      if (config.includePositionRelated) questionTypes.push('position-related');
      
      // 4. 调用AI生成问题
      setProgress(60);
      const questions = await generateQuestionsWithAI(
        resumeText,
        jobDetails.description,
        config.questionCount,
        questionTypes
      );
      
      // 5. 更新进度
      setProgress(90);
      
      // 6. 保存到历史记录
      const resumePreview = resumeData.text ? resumeData.text.substring(0, 100) : resumeData.file?.name;
      saveToHistory({
        jobTitle: jobDetails.title,
        companyName: jobDetails.company,
        questions,
        resumePreview
      });
      
      setProgress(100);
      setIsLoading(false);
      
      return questions;
    } catch (error) {
      console.error('生成问题时出错:', error);
      setIsLoading(false);
      setProgress(0);
      
      // 返回错误信息，让UI处理
      throw error;
    }
  };

  const regenerateQuestions = async (
    resumeData: ResumeData, 
    jobDetails: JobDetails,
    config: GenerationConfig = defaultConfig
  ): Promise<Question[]> => {
    return await generateQuestions(resumeData, jobDetails, config);
  };

  const downloadQuestions = (questions: Question[], format: 'json' | 'csv' | 'text' = 'text') => {
    let content = '';
    let filename = '';
    let contentType = '';

    switch (format) {
      case 'json':
        content = exportAsJSON(questions);
        filename = 'interview-questions.json';
        contentType = 'application/json';
        break;
      case 'csv':
        content = exportAsCSV(questions);
        filename = 'interview-questions.csv';
        contentType = 'text/csv';
        break;
      case 'text':
      default:
        content = exportAsText(questions);
        filename = 'interview-questions.txt';
        contentType = 'text/plain';
        break;
    }

    downloadFile(content, filename, contentType);
  };

  const shareQuestions = (questions: Question[]) => {
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: '面试问题',
        text: `我使用面试问题生成器生成的面试问题：\n\n${questions.map(q => q.text).join('\n\n')}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return {
    isLoading,
    progress,
    generateQuestions,
    regenerateQuestions,
    downloadQuestions,
    shareQuestions
  };
};