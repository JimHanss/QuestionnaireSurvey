import {
  clearQuestionnaireDraft,
  createEmptyDraft,
  loadQuestionnaireDraft,
  saveQuestionnaireDraft
} from './draftStorage';
import { questionnaireQuestions, sections } from '../data/questionnaire';

describe('draftStorage utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates an empty draft with question-shaped defaults', () => {
    const draft = createEmptyDraft(questionnaireQuestions);

    expect(draft.activeSectionIndex).toBe(0);
    expect(draft.values.projectType).toBe('');
    expect(draft.values.coreModules).toEqual([]);
  });

  it('saves and reloads a questionnaire draft', () => {
    const savedAt = saveQuestionnaireDraft({
      values: {
        ...createEmptyDraft(questionnaireQuestions).values,
        projectType: 'saas',
        coreModules: ['reporting']
      },
      skippedQuestions: {
        needsIntegration: true
      },
      activeSectionIndex: 1
    });

    const loadedDraft = loadQuestionnaireDraft(questionnaireQuestions, sections.length);

    expect(savedAt).not.toBeNull();
    expect(loadedDraft.values.projectType).toBe('saas');
    expect(loadedDraft.values.coreModules).toEqual(['reporting']);
    expect(loadedDraft.skippedQuestions.needsIntegration).toBe(true);
    expect(loadedDraft.activeSectionIndex).toBe(1);
  });

  it('clears persisted draft state', () => {
    saveQuestionnaireDraft({
      values: createEmptyDraft(questionnaireQuestions).values,
      skippedQuestions: {},
      activeSectionIndex: 0
    });

    clearQuestionnaireDraft();

    const loadedDraft = loadQuestionnaireDraft(questionnaireQuestions, sections.length);
    expect(loadedDraft.updatedAt).toBeNull();
  });
});
