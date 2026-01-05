import * as mammoth from 'mammoth';
import { ResumeData } from '@/types';

// 动态导入PDF.js以避免服务器端渲染问题
let pdfjsLib: any = null;

// 预加载PDF.js库
if (typeof window !== 'undefined') {
    (async () => {
      pdfjsLib = await import('pdfjs-dist');
      // 使用本地Worker文件而不是CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
    })();
  }

/**
 * 解析PDF文档内容
 * @param file PDF文件
 * @returns 解析后的文本内容
 */
export const parsePDF = async (file: File): Promise<string> => {
  // 确保在浏览器环境中
  if (typeof window === 'undefined') {
    throw new Error('PDF解析只能在浏览器环境中进行');
  }

  try {
    // 读取文件内容
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = () => reject(new Error('无法读取PDF文件'));
      fileReader.readAsArrayBuffer(file);
    });

    // 确保pdfjsLib已加载
    if (!pdfjsLib) {
      pdfjsLib = await import('pdfjs-dist');
      // 使用本地Worker文件而不是CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
    }

    const typedarray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF解析错误:', error);
    throw new Error('PDF解析失败: ' + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * 解析DOCX文档内容
 * @param file DOCX文件
 * @returns 解析后的文本内容
 */
export const parseDOCX = async (file: File): Promise<string> => {
  try {
    console.log('开始解析DOCX文件:', file.name, '大小:', file.size, '字节');
    console.log('文件类型:', file.type);

    // 尝试多种编码的readAsText方法
    const tryReadAsText = async (encoding: string = 'utf-8'): Promise<string> => {
      try {
        const textResult = await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = () => reject(new Error(`readAsText失败，编码: ${encoding}`));
          fileReader.readAsText(file, encoding);
        });
        console.log(`readAsText结果（${encoding}）长度:`, textResult.length);
        if (textResult.trim()) {
          console.log(`readAsText结果（${encoding}）前100字符:`, textResult.substring(0, 100));
        }
        return textResult;
      } catch (error) {
        console.error(`readAsText错误（${encoding}）:`, error);
        return '';
      }
    };

    // 读取文件为ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = () => reject(new Error('无法读取DOCX文件为ArrayBuffer'));
      fileReader.readAsArrayBuffer(file);
    });

    console.log('ArrayBuffer大小:', arrayBuffer.byteLength, '字节');

    // 尝试1: 使用extractRawText方法，带更多配置选项
    let result = await mammoth.extractRawText({ arrayBuffer }, {
      ignoreEmptyParagraphs: false
    });
    console.log('extractRawText结果:', JSON.stringify(result));
    console.log('extractRawText文本长度:', result.value.length);
    console.log('extractRawText消息:', JSON.stringify(result.messages));

    if (result.value.trim()) {
      return result.value;
    }

    // 尝试2: 使用convertToHtml方法
    console.log('尝试使用convertToHtml方法');
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    console.log('convertToHtml结果:', JSON.stringify(htmlResult));
    console.log('convertToHtml文本长度:', htmlResult.value.length);
    console.log('convertToHtml消息:', JSON.stringify(htmlResult.messages));

    if (htmlResult.value) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = htmlResult.value;
      const textContent = tempElement.textContent || tempElement.innerText || '';
      console.log('从HTML提取的文本长度:', textContent.length);
      if (textContent.trim()) {
        console.log('从HTML提取的文本前100字符:', textContent.substring(0, 100));
        return textContent;
      }
    }

    // 尝试3: 使用readAsText，先尝试utf-8
    console.log('尝试使用readAsText(utf-8)');
    let textResult = await tryReadAsText('utf-8');
    if (textResult.trim()) {
      return textResult;
    }

    // 尝试4: 使用readAsText，尝试gbk编码
    console.log('尝试使用readAsText(gbk)');
    textResult = await tryReadAsText('gbk');
    if (textResult.trim()) {
      return textResult;
    }

    // 尝试5: 使用readAsText，尝试utf-16le编码
    console.log('尝试使用readAsText(utf-16le)');
    textResult = await tryReadAsText('utf-16le');
    if (textResult.trim()) {
      return textResult;
    }

    // 尝试6: 直接从ArrayBuffer提取文本（非常底层的方法）
    console.log('尝试直接从ArrayBuffer提取文本');
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(arrayBuffer);
    console.log('直接解码结果长度:', rawText.length);
    if (rawText.trim()) {
      console.log('直接解码结果前100字符:', rawText.substring(0, 100));
      return rawText;
    }

    // 所有尝试都失败了
    console.error('所有DOCX解析方法都失败了');
    
    // 检查是否有任何非空白字符
    const allResults = [
      result.value,
      htmlResult?.value ? (() => { 
        const temp = document.createElement('div'); 
        temp.innerHTML = htmlResult.value; 
        return temp.textContent || ''; 
      })() : '',
      textResult,
      rawText
    ];
    
    for (let i = 0; i < allResults.length; i++) {
      if (allResults[i] && allResults[i].length > 0) {
        console.log(`结果${i}有内容，长度:`, allResults[i].length);
        console.log(`结果${i}内容:`, JSON.stringify(allResults[i]));
        return allResults[i]; // 返回第一个有内容的结果，即使是空白字符
      }
    }

    return '';
  } catch (error) {
    console.error('DOCX解析错误:', error);
    // 打印错误的完整信息
    if (error instanceof Error) {
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    
    // 发生错误时，最后尝试一次readAsText
    try {
      console.log('解析错误后最后尝试readAsText');
      const textResult = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = () => reject(new Error('最后尝试readAsText也失败了'));
        fileReader.readAsText(file);
      });
      if (textResult.trim()) {
        console.log('错误后readAsText成功，结果长度:', textResult.length);
        return textResult;
      }
    } catch (finalError) {
      console.error('最后尝试readAsText也失败了:', finalError);
    }
    
    throw new Error('DOCX解析失败: ' + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * 解析文档内容（支持PDF、DOCX和文本）
 * @param resumeData 简历数据
 * @returns 解析后的文本内容
 */
export const parseResumeDocument = async (resumeData: ResumeData): Promise<string> => {
  console.log('解析文档开始:', resumeData);
  
  if (resumeData.text) {
    console.log('使用文本简历:', resumeData.text.substring(0, 50) + '...');
    if (!resumeData.text.trim()) {
      throw new Error('简历文本不能为空');
    }
    return resumeData.text;
  }
  
  if (resumeData.file) {
    console.log('解析文件:', resumeData.file.name, '类型:', resumeData.file.type);
    
    if (resumeData.file.type === 'application/pdf') {
      console.log('解析PDF文件');
      const pdfText = await parsePDF(resumeData.file);
      console.log('PDF解析结果长度:', pdfText.length);
      if (!pdfText.trim()) {
        throw new Error('PDF文件解析结果为空');
      }
      return pdfText;
    } else if (resumeData.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               resumeData.file.name.endsWith('.docx')) {
      console.log('解析DOCX文件');
      const docxText = await parseDOCX(resumeData.file);
      console.log('DOCX解析结果长度:', docxText.length);
      if (!docxText.trim()) {
        throw new Error('DOCX文件解析结果为空');
      }
      return docxText;
    } else {
      // 对于非PDF和非DOCX文件，假设是文本文件
      console.log('解析文本文件');
      const text = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const result = fileReader.result as string;
          console.log('文本文件解析结果长度:', result.length);
          resolve(result);
        };
        fileReader.onerror = () => {
          reject(new Error('无法读取文件'));
        };
        fileReader.readAsText(resumeData.file!);
      });
      if (!text.trim()) {
        throw new Error('文本文件解析结果为空');
      }
      return text;
    }
  }
  
  console.error('没有提供简历数据');
  throw new Error('没有提供简历数据');
};

/**
 * 提取简历关键信息
 * @param resumeText 简历文本内容
 * @returns 提取的关键信息
 */
export const extractResumeInfo = (resumeText: string) => {
  // 简单的正则表达式提取关键信息
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const skillsRegex = /(技能|Skills|技术|TECHNICAL SKILLS|专业技能)[\s\S]*?([A-Z][a-z].*?)(?=教育|Education|工作|Experience|项目|Project|$)/gi;
  const experienceRegex = /(工作|Experience|工作经验|工作经历)[\s\S]*?([A-Z][a-z].*?)(?=教育|Education|技能|Skills|项目|Project|$)/gi;
  const educationRegex = /(教育|Education|教育背景)[\s\S]*?([A-Z][a-z].*?)(?=技能|Skills|工作|Experience|项目|Project|$)/gi;
  const projectsRegex = /(项目|Project|项目经验)[\s\S]*?([A-Z][a-z].*?)(?=技能|Skills|工作|Experience|教育|Education|$)/gi;
  
  return {
    email: resumeText.match(emailRegex) || [],
    phone: resumeText.match(phoneRegex) || [],
    skills: resumeText.match(skillsRegex) || [],
    experience: resumeText.match(experienceRegex) || [],
    education: resumeText.match(educationRegex) || [],
    projects: resumeText.match(projectsRegex) || [],
    summary: resumeText.substring(0, 500) // 简历摘要
  };
};