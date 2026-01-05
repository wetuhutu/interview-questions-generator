const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

try {
  // 加载环境变量
  require('dotenv').config({
    path: path.resolve(__dirname, '../.env.local')
  });

  // 动态导入需要的模块
  (async () => {
    console.log('=== 面试问题生成功能测试 ===');
    console.log('开始测试时间:', new Date().toLocaleString());

    // 1. 读取PDF文件（这里使用简单的文本模拟PDF解析结果）
    console.log('\n1. 模拟简历内容...');
    const resumeText = `
张三
计算机科学与技术专业 硕士

技能：
- 编程语言：JavaScript, TypeScript, Python
- 前端框架：React, Next.js
- 后端技术：Node.js, Express
- 数据库：MongoDB, MySQL
- 云服务：阿里云, AWS

工作经验：
2021-至今 某科技公司 高级前端开发工程师
- 负责公司核心产品的前端开发
- 参与架构设计和技术选型
- 带领团队完成多个重要项目
- 优化前端性能，提升用户体验

2019-2021 某互联网公司 前端开发工程师
- 负责Web应用的前端开发
- 实现响应式设计和交互功能
- 与后端团队协作完成API集成
    `;
    console.log('简历内容模拟完成');

    // 2. 模拟职位信息
    console.log('\n2. 准备职位信息...');
    const jobDetails = {
      title: '高级前端开发工程师',
      company: '某知名互联网公司',
      description: '我们正在寻找一位经验丰富的高级前端开发工程师，负责公司核心产品的前端开发和优化。要求：\n- 5年以上前端开发经验\n- 精通React, Next.js等前端框架\n- 熟悉TypeScript和现代化前端工具链\n- 具备良好的架构设计能力\n- 有大型项目开发经验\n- 良好的团队协作和沟通能力'
    };
    console.log('职位信息准备完成');
    console.log('职位名称:', jobDetails.title);
    console.log('公司名称:', jobDetails.company);

    // 3. 测试AI服务
    console.log('\n3. 测试AI服务...');
    
    // 直接测试AI服务的核心逻辑
    const testAIService = async () => {
      const DASHSCOPE_API_KEY = process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY;
      const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
      const MODEL_NAME = 'qwen2.5-7b-instruct';

      if (!DASHSCOPE_API_KEY) {
        throw new Error('未配置DashScope API密钥');
      }

      console.log('正在调用DashScope API...');
      
      // 构建AI提示词
      const prompt = `
      基于以下简历信息和职位描述，生成8个面试问题。
      
      简历信息：
      ${resumeText.substring(0, 2000)}
      
      职位描述：
      ${jobDetails.description}
      
      请生成以下类型的问题：
      technical, behavioral, position-related
      
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
      console.log('API响应:', JSON.stringify(data, null, 2));
      const content = data.output?.choices?.[0]?.message?.content || data.output?.text;
      
      if (!content) {
        throw new Error('AI未返回有效内容');
      }

      // 解析AI返回的JSON
      let questions;
      try {
        questions = JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[1]);
        } else {
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
        .filter((q) => q.text || q.question)
        .map((q, index) => ({
          id: q.id || `q${index + 1}`,
          text: q.text || q.question || '生成的问题',
          category: ['technical', 'behavioral', 'position-related'].includes(q.category) ? q.category : 'behavioral'
        }))
        .filter(q => q.text.trim().length > 10);

      return validatedQuestions;
    };

    try {
      const questions = await testAIService();
      
      console.log('\n4. 测试结果：');
      console.log(`✓ 成功生成 ${questions.length} 个面试问题`);
      
      console.log('\n5. 生成的问题列表：');
      questions.forEach((question, index) => {
        console.log(`\n${index + 1}. [${question.category}] ${question.text}`);
      });
      
      // 保存测试结果
      const testResult = {
        timestamp: new Date().toISOString(),
        jobDetails: {
          title: jobDetails.title,
          company: jobDetails.company
        },
        questions: questions,
        totalQuestions: questions.length
      };
      
      fs.writeFileSync(
        path.resolve(__dirname, 'test-results.json'),
        JSON.stringify(testResult, null, 2),
        'utf8'
      );
      
      console.log('\n✓ 测试结果已保存到 test/test-results.json');
      console.log('\n=== 测试完成 ===');
      console.log('完成时间:', new Date().toLocaleString());
      console.log('测试状态: 成功');
      
    } catch (error) {
      console.error('\n✗ 测试失败:', error.message);
      console.error('错误详情:', error);
      console.log('\n=== 测试完成 ===');
      console.log('完成时间:', new Date().toLocaleString());
      console.log('测试状态: 失败');
      process.exit(1);
    }
  })();

} catch (error) {
  console.error('测试脚本初始化失败:', error);
  process.exit(1);
}