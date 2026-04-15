import {
  QuestionDefinition,
  QuestionnaireDraft,
  QuestionnaireValues,
  SkipState
} from '../types';

// We use sessionStorage instead of localStorage so unfinished answers survive refreshes
// in the current tab, but disappear after the browsing session ends.
const STORAGE_KEY = 'requirements-navigator-session-draft';

const createDefaultValues = (questions: QuestionDefinition[]): QuestionnaireValues =>
  questions.reduce<QuestionnaireValues>((accumulator, question) => {
    accumulator[question.id] = question.type === 'checkbox' ? [] : '';
    return accumulator;
  }, {});

const sanitizeValues = (
  questions: QuestionDefinition[],
  rawValues: unknown
): QuestionnaireValues => {
  const defaultValues = createDefaultValues(questions);

  if (!rawValues || typeof rawValues !== 'object') {
    return defaultValues;
  }

  return questions.reduce<QuestionnaireValues>((accumulator, question) => {
    const candidate = (rawValues as Record<string, unknown>)[question.id];

    if (question.type === 'checkbox') {
      accumulator[question.id] = Array.isArray(candidate)
        ? candidate.filter((value): value is string => typeof value === 'string')
        : [];
      return accumulator;
    }

    accumulator[question.id] = typeof candidate === 'string' ? candidate : '';
    return accumulator;
  }, defaultValues);
};

const sanitizeSkippedQuestions = (rawSkipped: unknown): SkipState => {
  if (!rawSkipped || typeof rawSkipped !== 'object') {
    return {};
  }

  return Object.entries(rawSkipped as Record<string, unknown>).reduce<SkipState>(
    (accumulator, [key, value]) => {
      accumulator[key] = Boolean(value);
      return accumulator;
    },
    {}
  );
};

export const createEmptyDraft = (questions: QuestionDefinition[]): QuestionnaireDraft => ({
  values: createDefaultValues(questions),
  skippedQuestions: {},
  activeSectionIndex: 0,
  updatedAt: null
});

export const loadQuestionnaireDraft = (
  questions: QuestionDefinition[],
  sectionCount: number
): QuestionnaireDraft => {
  if (typeof window === 'undefined') {
    return createEmptyDraft(questions);
  }

  try {
    const rawDraft = window.sessionStorage.getItem(STORAGE_KEY);

    if (!rawDraft) {
      return createEmptyDraft(questions);
    }

    const parsedDraft = JSON.parse(rawDraft) as Partial<QuestionnaireDraft>;
    const activeSectionIndex =
      typeof parsedDraft.activeSectionIndex === 'number' &&
      parsedDraft.activeSectionIndex >= 0 &&
      parsedDraft.activeSectionIndex < sectionCount
        ? parsedDraft.activeSectionIndex
        : 0;

    return {
      values: sanitizeValues(questions, parsedDraft.values),
      skippedQuestions: sanitizeSkippedQuestions(parsedDraft.skippedQuestions),
      activeSectionIndex,
      updatedAt: typeof parsedDraft.updatedAt === 'string' ? parsedDraft.updatedAt : null
    };
  } catch {
    return createEmptyDraft(questions);
  }
};

export const saveQuestionnaireDraft = (
  draft: Omit<QuestionnaireDraft, 'updatedAt'>
): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // The timestamp powers the lightweight "draft saved" hint in the header.
    const updatedAt = new Date().toISOString();
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...draft,
        updatedAt
      })
    );

    return updatedAt;
  } catch {
    return null;
  }
};

export const clearQuestionnaireDraft = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
};
