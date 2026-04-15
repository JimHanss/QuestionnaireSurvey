import { memo } from 'react';
import { AnswerValue, QuestionDefinition, SectionDefinition, SectionStats } from '../types';
import { QuestionCard } from './QuestionCard';

interface QuestionnaireSectionPanelProps {
  section: SectionDefinition;
  visibleQuestions: QuestionDefinition[];
  sectionProgress: SectionStats;
  answers: Record<string, AnswerValue>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  skippedQuestions: Record<string, boolean>;
  activeSectionIndex: number;
  totalSections: number;
  onBack: () => void;
  onContinue: () => void;
  onQuestionBlur: (questionId: string) => void;
  onQuestionChange: (questionId: string, value: AnswerValue) => void;
  onSkipQuestion: (question: QuestionDefinition) => void;
}

export const QuestionnaireSectionPanel = memo(function QuestionnaireSectionPanel({
  section,
  visibleQuestions,
  sectionProgress,
  answers,
  errors,
  touched,
  skippedQuestions,
  activeSectionIndex,
  totalSections,
  onBack,
  onContinue,
  onQuestionBlur,
  onQuestionChange,
  onSkipQuestion
}: QuestionnaireSectionPanelProps) {
  return (
    <section className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
            Section questions
          </div>
          <h2 className="mt-2 font-display text-3xl">{section.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Optional questions can be skipped and will be called out in the final report.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Required prompts must be answered before moving to the next stop.
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {visibleQuestions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            displayIndex={index + 1}
            visibleCount={visibleQuestions.length}
            value={answers[question.id]}
            error={errors[question.id]}
            touched={touched[question.id]}
            skipped={Boolean(skippedQuestions[question.id])}
            onBlur={onQuestionBlur}
            onChange={onQuestionChange}
            onSkip={onSkipQuestion}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          Stop summary: {sectionProgress.answered} answered, {sectionProgress.skipped} skipped,{' '}
          {sectionProgress.unanswered} still open.
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={activeSectionIndex === 0}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {activeSectionIndex === totalSections - 1 ? 'Generate report' : 'Save and continue'}
          </button>
        </div>
      </div>
    </section>
  );
});
