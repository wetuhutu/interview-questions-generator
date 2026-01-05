import { Question } from '@/types';
import { extractResumeInfo } from '@/utils/documentParser';

// DashScope API配置
const DASHSCOPE_API_KEY = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const MODEL_NAME = 'qwen2.5-7b-instruct';

/**
 * 生成面试问题的AI分析引擎
 * @param resumeText 简历文本
 * @param jobDescription 职位描述
 * @param questionCount 问题数量
 * @param questionTypes 问题类型分布
 * @returns 生成的面试问题数组
 */
export const generateQuestionsWithAI = async (
  resumeText: string, 
  jobDescription: string, 
  questionCount: number = 8,
  questionTypes: string[] = ['technical', 'behavioral', 'position-related']
): Promise<Question[]> => {
  // 检查是否在浏览器环境
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // 浏览器环境：调用内部API路由
    try {
      console.log('正在调用内部API路由...');
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          questionCount,
          questionTypes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成问题失败');
      }
      
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('浏览器端API调用错误:', error);
      // 如果API调用失败，返回备用问题
      return generateFallbackQuestions();
    }
  } else {
    // 服务器环境：直接调用DashScope API
    try {
      // 提取简历关键信息
      const resumeInfo = extractResumeInfo(resumeText);
      
      // 构建AI提示词
      const prompt = `
      基于以下简历信息和职位描述，生成${questionCount}个面试问题。
      
      简历信息：
      ${resumeText.substring(0, 2000)}
      
      职位描述：
      ${jobDescription}
      
      请生成以下类型的问题：
      ${questionTypes.join(', ')}
      
      每个问题需要：
      1. 与简历内容和职位要求相关
      2. 针对候选人的技能、经验或项目
      3. 包含具体的情境或细节
      4. 能够评估候选人是否适合该职位
      
      请以JSON格式返回，格式如下：
      [
        {
          "id": "唯一标识符",
          "text": "问题文本",
          "category": "technical | behavioral | position-related"
        }
      ]
      
      请确保问题具有针对性，能有效评估候选人与职位的匹配度。
      `;
      
      // 调用DashScope API
      console.log('正在调用DashScope API...');
      const response = await fetch(DASHSCOPE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个专业的面试官，擅长根据简历和职位描述生成有针对性的面试问题。请严格按照JSON格式返回结果，不要包含任何其他文字说明。'
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: 'json_object' }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.message || '未知错误';
        // 针对常见错误提供更具体的提示
        if (response.status === 401) {
          errorMessage = 'API密钥验证失败，请检查密钥是否正确';
        } else if (response.status === 429) {
          errorMessage = 'API请求频率过高，请稍后再试';
        } else if (response.status === 503) {
          errorMessage = 'DashScope服务暂时不可用，请稍后再试';
        }
        throw new Error(`DashScope API错误: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      // 处理不同的API响应结构
      const content = data.choices?.[0]?.message?.content || data.output?.choices?.[0]?.message?.content || data.output?.text;
      
      if (!content) {
        throw new Error('AI未返回有效内容');
      }
      
      // 解析AI返回的JSON
      let questions: any[];
      try {
        // 尝试直接解析JSON
        questions = JSON.parse(content);
      } catch (parseError) {
        // 如果直接解析失败，尝试从代码块中提取JSON
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[1]);
        } else {
          // 如果仍然失败，尝试提取JSON部分
          const jsonPart = content.match(/\[.*\]/s);
          if (jsonPart) {
            questions = JSON.parse(jsonPart[0]);
          } else {
            throw new Error('无法解析AI返回的JSON格式');
          }
        }
      }
      
      // 验证并格式化问题
      const validatedQuestions = questions
        .filter((q: any) => q.text || q.question) // 过滤掉空问题
        .map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          text: q.text || q.question || '生成的问题',
          category: validateCategory(q.category || 'behavioral')
        }))
        .filter(q => q.text.trim().length > 10); // 确保问题长度足够
        
      // 如果验证后的问题数量不足，补充备用问题
      if (validatedQuestions.length < Math.min(4, questionCount)) {
        console.warn('AI生成的问题质量不足，使用备用问题补充');
        const fallbackQuestions = generateFallbackQuestions();
        const allQuestions = [...validatedQuestions, ...fallbackQuestions];
        // 去重并限制数量
        const uniqueQuestions = allQuestions
          .filter((q, index, self) => 
            index === self.findIndex(t => t.text === q.text)
          )
          .slice(0, questionCount);
        return uniqueQuestions;
      }
      
      return validatedQuestions.slice(0, questionCount);
    } catch (error) {
      console.error('服务器端AI问题生成错误:', error);
      // 如果AI调用失败，返回备用问题
      return generateFallbackQuestions();
    }
  }
};

/**
 * 验证问题类别
 * @param category 问题类别
 * @returns 有效的问题类别
 */
const validateCategory = (category: string): 'technical' | 'behavioral' | 'position-related' => {
  if (category === 'technical' || category === 'behavioral' || category === 'position-related') {
    return category;
  }
  return 'behavioral'; // 默认返回behavioral
};

/**
 * 备用问题生成（当AI调用失败时）
 * @returns 备用问题数组
 */
const generateFallbackQuestions = (): Question[] => {
  return [
    {
      id: 'fallback-1',
      text: '请介绍一下您的背景和为什么对这个职位感兴趣？',
      category: 'behavioral'
    },
    {
      id: 'fallback-2',
      text: '您在过往项目中遇到的最大挑战是什么？您是如何解决的？',
      category: 'behavioral'
    },
    {
      id: 'fallback-3',
      text: '请描述一下您在简历中提到的某个项目的技术实现细节？',
      category: 'technical'
    },
    {
      id: 'fallback-4',
      text: '您对我们公司和这个职位了解多少？',
      category: 'position-related'
    }
  ];
};

/**
 * 配置参数接口
 */
export interface GenerationConfig {
  questionCount: number;
  questionTypes: ('technical' | 'behavioral' | 'position-related')[];
  difficultyLevel: 'junior' | 'mid' | 'senior';
  includeTechnical: boolean;
  includeBehavioral: boolean;
  includePositionRelated: boolean;
}