export interface LessonSection {
  heading: string;
  body: string;
  bullets?: string[];
  code?: string;
  tip?: string;
}

export interface SourceAttribution {
  repo: string;
  url: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  moduleId: string;
  title: string;
  sections: LessonSection[];
  complexityTradeoffs?: string[];
  interviewTips?: string[];
  keyTakeaways: string[];
  sourceAttribution: SourceAttribution[];
  quiz: QuizQuestion[];
}
