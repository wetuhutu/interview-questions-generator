import { Question } from '@/types';

/**
 * 将问题导出为JSON格式
 * @param questions 问题数组
 * @returns JSON字符串
 */
export const exportAsJSON = (questions: Question[]): string => {
  return JSON.stringify(questions, null, 2);
};

/**
 * 将问题导出为CSV格式
 * @param questions 问题数组
 * @returns CSV字符串
 */
export const exportAsCSV = (questions: Question[]): string => {
  const headers = ['ID', 'Question', 'Category'];
  const rows = questions.map(q => [q.id, `"${q.text.replace(/"/g, '""')}"`, q.category]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * 将问题导出为文本格式
 * @param questions 问题数组
 * @returns 文本字符串
 */
export const exportAsText = (questions: Question[]): string => {
  return questions
    .map((q, index) => `${index + 1}. [${q.category}] ${q.text}`)
    .join('\n\n');
};

/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param contentType 内容类型
 */
export const downloadFile = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};