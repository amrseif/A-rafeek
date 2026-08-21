export type CognitiveType = 'memorization' | 'problem_solving' | 'deep_reading';

export interface PomodoroConfig {
  focus_minutes: number;
  break_minutes: number;
}

export interface ActiveRecallQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface DeepDiveData {
  focus_nudge: string;
  active_recall_questions: ActiveRecallQuestion[];
  retention_strategy: string;
}

export interface TaskItem {
  task_id: string;
  title: string;
  cognitive_type: CognitiveType;
  type_label_arabic?: string;
  estimated_minutes: number;
  pomodoro_setting?: PomodoroConfig;
  recommended_pomodoro?: PomodoroConfig;
  steps?: string[];
  micro_steps?: string[];
  completed?: boolean;
  completedSteps?: number[];
  notes?: string;
  startedAt?: number;
  spentSeconds?: number;
}

export interface DaySchedule {
  day_number: number;
  day_title_arabic: string;
  tasks: TaskItem[];
}

export interface CognitiveDistribution {
  deep_reading_percentage: number;
  problem_solving_percentage: number;
  memorization_percentage: number;
}

export interface StudyPlanSummary {
  total_estimated_minutes: number;
  total_tasks_count: number;
  overview_arabic: string;
  pro_tip_arabic?: string;
}

export interface StudyDeconstructionResponse {
  summary: StudyPlanSummary;
  distribution?: CognitiveDistribution;
  schedule: DaySchedule[];
  suggested_schedule?: DaySchedule[];
  pro_tip_arabic?: string;
  contextual_tip_arabic?: string;
}

export interface SavedPlan {
  id: string;
  title: string;
  createdAt: string;
  plan: StudyDeconstructionResponse;
  rawInput: string;
  studyDays: number;
  dailyHours: number;
  difficulty: string;
}

export interface ActiveTimerState {
  taskId: string | null;
  taskTitle: string;
  cognitiveType: CognitiveType;
  mode: 'focus' | 'break' | 'long_break';
  totalDurationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  pomodoroRound: number;
}

export type AppTheme = 'dark' | 'light' | 'nordic' | 'cyber';

export type UserPersonaMode = 'gen_z' | 'gen_alpha' | 'classic';

