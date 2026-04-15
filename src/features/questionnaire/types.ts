export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';

export type AnswerValue = string | string[];

export type QuestionnaireValues = Record<string, AnswerValue>;

export type DraftSaveState = 'idle' | 'saving' | 'saved';

export type SkipState = Record<string, boolean>;

export interface QuestionOption {
  label: string;
  value: string;
  note?: string;
}

export interface VisibilityRule {
  questionId: string;
  operator: 'equals' | 'includes';
  value: string | string[];
}

export interface SectionDefinition {
  id: string;
  title: string;
  summary: string;
}

export interface QuestionDefinition {
  id: string;
  sectionId: string;
  type: QuestionType;
  title: string;
  helperText: string;
  placeholder?: string;
  required: boolean;
  skippable: boolean;
  options?: QuestionOption[];
  visibleWhen?: VisibilityRule;
}

export interface SectionStats {
  sectionId: string;
  total: number;
  answered: number;
  skipped: number;
  hidden: number;
  unanswered: number;
  completionRate: number;
}

export interface ReportQuestionRow {
  questionId: string;
  title: string;
  status: 'Answered' | 'Skipped' | 'Unanswered' | 'Not applicable';
  answer: string;
  required: boolean;
}

export interface ReportSection {
  sectionId: string;
  title: string;
  summary: string;
  stats: SectionStats;
  rows: ReportQuestionRow[];
}

export interface FollowUpItem {
  sectionId: string;
  sectionTitle: string;
  questionId: string;
  questionTitle: string;
  status: 'Skipped' | 'Unanswered';
  required: boolean;
  answer: string;
}

export interface QuestionnaireSummary {
  totalQuestions: number;
  totalVisible: number;
  answered: number;
  skipped: number;
  unanswered: number;
  hidden: number;
  completionRate: number;
  requiredAnswered: number;
  requiredVisible: number;
  followUpCount: number;
  readinessLabel: 'Needs input' | 'In progress' | 'Ready for handoff';
}

export interface QuestionnaireDraft {
  values: QuestionnaireValues;
  skippedQuestions: SkipState;
  activeSectionIndex: number;
  updatedAt: string | null;
}
