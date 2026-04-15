import { buildReportMarkdown, formatTimestamp } from './reportExport';
import { createInitialValues, questionnaireQuestions, sections } from '../data/questionnaire';
import { getFollowUpItems, getQuestionnaireSummary, getReportSections } from './questionFlow';

describe('reportExport utilities', () => {
  it('formats timestamps for user-facing status text', () => {
    expect(formatTimestamp(null)).toBe('Not saved yet');
    expect(formatTimestamp('2026-04-13T12:30:00.000Z')).toContain('2026');
  });

  it('builds a markdown handoff report with summary and follow-up items', () => {
    const values = createInitialValues(questionnaireQuestions);
    values.projectType = 'saas';
    values.targetUsers = 'Operations managers';
    values.requiresAuthentication = 'no';
    values.coreModules = ['reporting'];
    values.supportedPlatforms = ['desktop-web'];
    values.launchWindow = 'planned';
    values.qualityExpectations = ['security'];

    const skipped = { needsIntegration: true };
    const reportSections = getReportSections(sections, questionnaireQuestions, values, skipped);
    const summary = getQuestionnaireSummary(sections, questionnaireQuestions, values, skipped);
    const followUps = getFollowUpItems(sections, questionnaireQuestions, values, skipped);

    const markdown = buildReportMarkdown({
      sections: reportSections,
      summary,
      followUpItems: followUps,
      generatedAt: '2026-04-13T12:30:00.000Z'
    });

    expect(markdown).toContain('# Requirements Navigator Report');
    expect(markdown).toContain('## Executive Summary');
    expect(markdown).toContain('## Open Follow-Up Items');
    expect(markdown).toContain('Will the product integrate with any third-party or internal systems?');
  });
});
