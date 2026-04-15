import {
  buildQuestionnaireDerivedState,
  buildSectionSchema,
  getFollowUpItems,
  getQuestionnaireSummary,
  getReportSections,
  getSectionStats,
  getVisibleSectionQuestions
} from './questionFlow';
import { createInitialValues, questionnaireQuestions, sections } from '../data/questionnaire';

describe('questionFlow utilities', () => {
  it('hides conditional questions until the triggering answer is selected', () => {
    const values = createInitialValues(questionnaireQuestions);

    const beforeTrigger = getVisibleSectionQuestions(questionnaireQuestions, 'scope-shaping', values);
    expect(beforeTrigger.some((question) => question.id === 'roleModel')).toBe(false);

    values.requiresAuthentication = 'yes';

    const afterTrigger = getVisibleSectionQuestions(questionnaireQuestions, 'scope-shaping', values);
    expect(afterTrigger.some((question) => question.id === 'roleModel')).toBe(true);
  });

  it('builds section stats that separate answered, skipped, and hidden questions', () => {
    const values = createInitialValues(questionnaireQuestions);
    values.projectType = 'saas';
    values.targetUsers = 'Product managers need a central hub.';
    values.requiresAuthentication = 'no';
    values.coreModules = ['reporting'];

    const stats = getSectionStats(
      'scope-shaping',
      questionnaireQuestions,
      values,
      { needsIntegration: true }
    );

    expect(stats.answered).toBe(2);
    expect(stats.skipped).toBe(1);
    expect(stats.hidden).toBe(2);
    expect(stats.unanswered).toBe(0);
  });

  it('marks skipped and not applicable answers in the report output', () => {
    const values = createInitialValues(questionnaireQuestions);
    values.projectType = 'internal';
    values.targetUsers = 'Finance leads';
    values.requiresAuthentication = 'yes';
    values.roleModel = ['admin'];
    values.coreModules = ['user-management'];
    values.needsIntegration = 'no';
    values.supportedPlatforms = ['desktop-web'];
    values.launchWindow = 'planned';
    values.qualityExpectations = ['audit'];

    const report = getReportSections(sections, questionnaireQuestions, values, {
      businessCriticality: true,
      openRisks: true
    });

    const projectFrameRows = report.find((section) => section.sectionId === 'project-frame')?.rows;
    const deliveryRows = report.find((section) => section.sectionId === 'delivery-guardrails')?.rows;
    const scopeRows = report.find((section) => section.sectionId === 'scope-shaping')?.rows;

    expect(projectFrameRows?.find((row) => row.questionId === 'businessCriticality')?.status).toBe(
      'Skipped'
    );
    expect(scopeRows?.find((row) => row.questionId === 'integrationDetails')?.status).toBe(
      'Not applicable'
    );
    expect(deliveryRows?.find((row) => row.questionId === 'openRisks')?.status).toBe('Skipped');
  });

  it('builds overall summary and follow-up items for the workbench view', () => {
    const values = createInitialValues(questionnaireQuestions);
    values.projectType = 'internal';
    values.targetUsers = 'Finance leads';
    values.requiresAuthentication = 'yes';
    values.roleModel = ['admin'];
    values.coreModules = ['user-management'];

    const followUps = getFollowUpItems(sections, questionnaireQuestions, values, {
      businessCriticality: true
    });
    const summary = getQuestionnaireSummary(sections, questionnaireQuestions, values, {
      businessCriticality: true
    });

    expect(followUps.some((item) => item.questionId === 'businessCriticality')).toBe(true);
    expect(summary.readinessLabel).toBe('In progress');
    expect(summary.followUpCount).toBeGreaterThan(0);
    expect(summary.requiredAnswered).toBe(5);
  });

  it('derives visible questions, section stats, report rows, and summary in one pass', () => {
    const values = createInitialValues(questionnaireQuestions);
    values.projectType = 'saas';
    values.targetUsers = 'Operations leads';
    values.requiresAuthentication = 'yes';
    values.roleModel = ['admin'];
    values.coreModules = ['reporting'];
    values.supportedPlatforms = ['desktop-web'];
    values.launchWindow = 'planned';
    values.qualityExpectations = ['security'];

    const derivedState = buildQuestionnaireDerivedState(
      sections,
      questionnaireQuestions,
      values,
      { businessCriticality: true }
    );

    expect(
      derivedState.visibleQuestionsBySectionId['scope-shaping'].some(
        (question) => question.id === 'roleModel'
      )
    ).toBe(true);
    expect(derivedState.sectionStatsBySectionId['project-frame'].skipped).toBe(1);
    expect(derivedState.reportSections).toHaveLength(sections.length);
    expect(derivedState.followUpItems.some((item) => item.questionId === 'businessCriticality')).toBe(
      true
    );
    expect(derivedState.summary.readinessLabel).toBe('In progress');
  });

  it('requires required fields and allows optional questions to stay empty', async () => {
    const values = createInitialValues(questionnaireQuestions);
    const projectQuestions = getVisibleSectionQuestions(
      questionnaireQuestions,
      'project-frame',
      values
    );

    await expect(buildSectionSchema(projectQuestions).validate(values)).rejects.toThrow();

    values.projectType = 'mobile';
    values.targetUsers = 'Field teams';

    await expect(
      buildSectionSchema(projectQuestions).validate(values, { abortEarly: false })
    ).resolves.toBeTruthy();
  });
});
