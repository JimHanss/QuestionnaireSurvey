import { FollowUpItem, QuestionnaireSummary, ReportSection } from '../types';

export const formatTimestamp = (value: string | null): string => {
  if (!value) {
    return 'Not saved yet';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

interface MarkdownPayload {
  sections: ReportSection[];
  summary: QuestionnaireSummary;
  followUpItems: FollowUpItem[];
  generatedAt: string;
}

export const buildReportMarkdown = ({
  sections,
  summary,
  followUpItems,
  generatedAt
}: MarkdownPayload): string => {
  const lines: string[] = [
    '# Requirements Navigator Report',
    '',
    `Generated: ${formatTimestamp(generatedAt)}`,
    '',
    '## Executive Summary',
    '',
    `- Readiness: ${summary.readinessLabel}`,
    `- Completion rate: ${summary.completionRate}%`,
    `- Answered: ${summary.answered}`,
    `- Skipped: ${summary.skipped}`,
    `- Unanswered: ${summary.unanswered}`,
    `- Required answered: ${summary.requiredAnswered}/${summary.requiredVisible}`,
    ''
  ];

  if (followUpItems.length > 0) {
    lines.push('## Open Follow-Up Items', '');
    followUpItems.forEach((item) => {
      lines.push(
        `- [${item.status}] ${item.sectionTitle} -> ${item.questionTitle} (${item.required ? 'Required' : 'Optional'})`
      );
    });
    lines.push('');
  }

  sections.forEach((section) => {
    lines.push(`## ${section.title}`, '', section.summary, '');
    section.rows.forEach((row) => {
      lines.push(`### ${row.title}`);
      lines.push(`- Status: ${row.status}`);
      lines.push(`- Priority: ${row.required ? 'Required' : 'Optional'}`);
      lines.push(`- Response: ${row.answer}`);
      lines.push('');
    });
  });

  return lines.join('\n').trim();
};

export const downloadMarkdownReport = (content: string, fileName = 'requirements-report.md'): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
