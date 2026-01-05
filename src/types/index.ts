export interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'position-related';
}

export interface JobDetails {
  title: string;
  company: string;
  description: string;
}

export interface ResumeData {
  file?: File;
  text?: string;
}

export interface GenerationConfig {
  questionCount: number;
  questionTypes: ('technical' | 'behavioral' | 'position-related')[];
  difficultyLevel: 'junior' | 'mid' | 'senior';
  includeTechnical: boolean;
  includeBehavioral: boolean;
  includePositionRelated: boolean;
}

export interface ParsedResumeInfo {
  email: string[];
  phone: string[];
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  summary: string;
}