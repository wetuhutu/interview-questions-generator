'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import InputSection from '@/components/InputSection';
import ResultsSection from '@/components/ResultsSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import HistorySection from '@/components/HistorySection';
import { useQuestionsGenerator } from '@/hooks/useQuestionsGenerator';
import { ResumeData, JobDetails, Question } from '@/types';

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>({});
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: '',
    company: '',
    description: ''
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const {
    isLoading,
    progress,
    generateQuestions,
    regenerateQuestions,
    downloadQuestions,
    shareQuestions
  } = useQuestionsGenerator();

  const handleGenerate = async (config: import('@/types').GenerationConfig) => {
    if (!resumeData.file && !resumeData.text) {
      alert('请上传简历或粘贴简历文本');
      return;
    }
    
    if (!jobDetails.title || !jobDetails.description) {
      alert('请填写职位名称和职位描述');
      return;
    }
    
    try {
      const newQuestions = await generateQuestions(resumeData, jobDetails, config);
      setQuestions(newQuestions);
    } catch (error) {
      console.error('生成面试问题失败:', error);
      // 显示友好的错误信息给用户
      if (error instanceof Error) {
        alert(`生成面试问题失败: ${error.message}`);
      } else {
        alert('生成面试问题失败，请稍后重试');
      }
    }
  };

  const handleRegenerate = async () => {
    try {
      const newQuestions = await regenerateQuestions(resumeData, jobDetails);
      setQuestions(newQuestions);
    } catch (error) {
      console.error('重新生成面试问题失败:', error);
      // 显示友好的错误信息给用户
      if (error instanceof Error) {
        alert(`重新生成面试问题失败: ${error.message}`);
      } else {
        alert('重新生成面试问题失败，请稍后重试');
      }
    }
  };

  const handleLoadHistory = (questions: Question[]) => {
    // 从历史记录加载问题
    setQuestions(questions);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main>
        <HeroSection />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-white rounded-xl shadow-xl p-6">
            <InputSection
              resumeData={resumeData}
              jobDetails={jobDetails}
              onResumeChange={setResumeData}
              onJobDetailsChange={setJobDetails}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              progress={progress}
            />
            
            <ResultsSection
              questions={questions}
              onDownload={downloadQuestions}
              onRegenerate={handleRegenerate}
              onShare={shareQuestions}
              isLoading={isLoading}
            />
            
            <HistorySection onSelectHistoryItem={handleLoadHistory} />
          </div>
        </div>
        
        <FeaturesSection />
      </main>
      
      <Footer />
      
      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
}