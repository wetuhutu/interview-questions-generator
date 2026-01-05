import { NextRequest, NextResponse } from 'next/server';
import { generateQuestionsWithAI } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, questionCount, questionTypes } = await request.json();
    
    // 验证输入参数
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: '缺少必要参数：resumeText 和 jobDescription' },
        { status: 400 }
      );
    }
    
    // 调用AI服务生成问题
    const questions = await generateQuestionsWithAI(
      resumeText,
      jobDescription,
      questionCount || 8,
      questionTypes || ['technical', 'behavioral', 'position-related']
    );
    
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('API路由错误:', error);
    
    let errorMessage = '生成问题失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
