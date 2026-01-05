// 本地存储工具函数
const HISTORY_KEY = 'interview_questions_history';

export interface HistoryItem {
  id: string;
  timestamp: string;
  jobTitle: string;
  companyName: string;
  questions: any[];
  resumePreview?: string; // 简历预览（仅前100个字符）
}

export const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  
  // 添加到历史记录的开头
  history.unshift(newItem);
  
  // 限制历史记录数量为20条
  if (history.length > 20) {
    history.pop();
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newItem;
};

export const getHistory = (): HistoryItem[] => {
  try {
    const historyString = localStorage.getItem(HISTORY_KEY);
    if (historyString) {
      return JSON.parse(historyString);
    }
    return [];
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
};

export const removeFromHistory = (id: string) => {
  const history = getHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};