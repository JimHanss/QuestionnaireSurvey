import { Formik, FormikHelpers, FormikProps } from 'formik';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import { JourneyProgress } from './features/questionnaire/components/JourneyProgress';
import { QuestionnaireHeader } from './features/questionnaire/components/QuestionnaireHeader';
import { QuestionnaireSectionPanel } from './features/questionnaire/components/QuestionnaireSectionPanel';
import { ReportPanel } from './features/questionnaire/components/ReportPanel';
import { questionnaireQuestions, sections } from './features/questionnaire/data/questionnaire';
import {
  createEmptyDraft,
  clearQuestionnaireDraft,
  loadQuestionnaireDraft,
  saveQuestionnaireDraft
} from './features/questionnaire/utils/draftStorage';
import {
  buildSectionSchema,
  buildQuestionnaireDerivedState,
  getVisibleSectionQuestions
} from './features/questionnaire/utils/questionFlow';
import {
  buildReportMarkdown,
  downloadMarkdownReport
} from './features/questionnaire/utils/reportExport';
import {
  DraftSaveState,
  QuestionDefinition,
  QuestionnaireDraft,
  QuestionnaireValues,
  SkipState
} from './features/questionnaire/types';

interface QuestionnaireScreenProps {
  formik: FormikProps<QuestionnaireValues>;
  activeSectionIndex: number;
  setActiveSectionIndex: Dispatch<SetStateAction<number>>;
  skippedQuestions: SkipState;
  setSkippedQuestions: Dispatch<SetStateAction<SkipState>>;
  isReportVisible: boolean;
  setIsReportVisible: Dispatch<SetStateAction<boolean>>;
  generatedAt: string | null;
  lastSavedAt: string | null;
  setLastSavedAt: Dispatch<SetStateAction<string | null>>;
  draftSaveState: DraftSaveState;
  setDraftSaveState: Dispatch<SetStateAction<DraftSaveState>>;
  onRestartQuestionnaire: () => void;
}

const mapValidationErrors = (error: unknown): Record<string, string> => {
  if (!error || typeof error !== 'object' || !('inner' in error)) {
    return {};
  }

  const validationError = error as {
    inner: Array<{ path?: string; message: string }>;
  };

  return validationError.inner.reduce<Record<string, string>>((errorMap, issue) => {
    if (issue.path) {
      errorMap[issue.path] = issue.message;
    }

    return errorMap;
  }, {});
};

function QuestionnaireScreen({
  formik,
  activeSectionIndex,
  setActiveSectionIndex,
  skippedQuestions,
  setSkippedQuestions,
  isReportVisible,
  setIsReportVisible,
  generatedAt,
  lastSavedAt,
  setLastSavedAt,
  draftSaveState,
  setDraftSaveState,
  onRestartQuestionnaire
}: QuestionnaireScreenProps) {
  const currentSection = sections[activeSectionIndex];
  const { setFieldTouched, setFieldValue } = formik;

  const questionnaireDerivedState = useMemo(
    () =>
      buildQuestionnaireDerivedState(
        sections,
        questionnaireQuestions,
        formik.values,
        skippedQuestions
      ),
    [formik.values, skippedQuestions]
  );

  const visibleQuestions =
    questionnaireDerivedState.visibleQuestionsBySectionId[currentSection.id] ?? [];
  const currentSectionProgress =
    questionnaireDerivedState.sectionStatsBySectionId[currentSection.id];
  const reportSections = questionnaireDerivedState.reportSections;
  const followUpItems = questionnaireDerivedState.followUpItems;
  const questionnaireSummary = questionnaireDerivedState.summary;

  useEffect(() => {
    // Pause autosave while the completion view is open so the report screen
    // does not keep rewriting the in-progress session draft.
    if (isReportVisible) {
      return;
    }

    setDraftSaveState('saving');

    const saveTimeout = window.setTimeout(() => {
      const updatedAt = saveQuestionnaireDraft({
        values: formik.values,
        skippedQuestions,
        activeSectionIndex
      });

      if (updatedAt) {
        setLastSavedAt(updatedAt);
      }

      setDraftSaveState('saved');
    }, 450);

    return () => window.clearTimeout(saveTimeout);
  }, [
    activeSectionIndex,
    formik.values,
    isReportVisible,
    setDraftSaveState,
    setLastSavedAt,
    skippedQuestions
  ]);

  const clearSkippedQuestion = useCallback((questionId: string) => {
    setSkippedQuestions((previousSkipped) => {
      if (!previousSkipped[questionId]) {
        return previousSkipped;
      }

      return {
        ...previousSkipped,
        [questionId]: false
      };
    });
  }, [setSkippedQuestions]);

  const handleSkipQuestion = useCallback((question: QuestionDefinition) => {
    const emptyValue = question.type === 'checkbox' ? [] : '';
    void setFieldValue(question.id, emptyValue, false);

    setSkippedQuestions((previousSkipped) => ({
      ...previousSkipped,
      [question.id]: true
    }));
  }, [setFieldValue, setSkippedQuestions]);

  const handleQuestionBlur = useCallback((questionId: string) => {
    void setFieldTouched(questionId, true);
  }, [setFieldTouched]);

  const handleQuestionChange = useCallback(
    (questionId: string, nextValue: QuestionnaireValues[string]) => {
      clearSkippedQuestion(questionId);
      void setFieldValue(questionId, nextValue, false);
    },
    [clearSkippedQuestion, setFieldValue]
  );

  const handleContinue = async () => {
    const validationErrors = await formik.validateForm();
    const invalidVisibleQuestionIds = visibleQuestions
      .map((question) => question.id)
      .filter((questionId) => validationErrors[questionId]);

    if (invalidVisibleQuestionIds.length > 0) {
      await Promise.all(
        invalidVisibleQuestionIds.map((questionId) => setFieldTouched(questionId, true))
      );
      return;
    }

    if (activeSectionIndex === sections.length - 1) {
      await formik.submitForm();
      return;
    }

    setActiveSectionIndex((currentIndex) => currentIndex + 1);
  };

  const handleBack = () => {
    setIsReportVisible(false);
    setActiveSectionIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const handleDownloadReport = () => {
    const markdown = buildReportMarkdown({
      sections: reportSections,
      summary: questionnaireSummary,
      followUpItems,
      generatedAt: generatedAt ?? new Date().toISOString()
    });

    downloadMarkdownReport(markdown);
  };

  return (
    <div className="min-h-screen px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <QuestionnaireHeader
          draftSaveState={draftSaveState}
          lastSavedAt={lastSavedAt}
          isReportVisible={isReportVisible}
        />

        <JourneyProgress
          activeSectionId={currentSection.id}
          sections={sections}
          isReportComplete={isReportVisible}
          onSelectSection={(sectionId) => {
            setIsReportVisible(false);
            setActiveSectionIndex(
              sections.findIndex((section) => section.id === sectionId)
            );
          }}
        />

        <main className="space-y-6">
          {!isReportVisible ? (
            <QuestionnaireSectionPanel
              section={currentSection}
              visibleQuestions={visibleQuestions}
              sectionProgress={currentSectionProgress}
              answers={formik.values}
              errors={formik.errors}
              touched={formik.touched}
              skippedQuestions={skippedQuestions}
              activeSectionIndex={activeSectionIndex}
              totalSections={sections.length}
              onBack={handleBack}
              onContinue={() => {
                setIsReportVisible(false);
                void handleContinue();
              }}
              onQuestionBlur={handleQuestionBlur}
              onQuestionChange={handleQuestionChange}
              onSkipQuestion={handleSkipQuestion}
            />
          ) : null}

          {/* Only render the final handoff after the user completes the flow. */}
          <ReportPanel
            sections={reportSections}
            summary={questionnaireSummary}
            followUpItems={followUpItems}
            isVisible={isReportVisible}
            totalQuestions={questionnaireQuestions.length}
            generatedAt={generatedAt}
            lastSavedAt={lastSavedAt}
            onDownloadReport={handleDownloadReport}
            onRestartQuestionnaire={onRestartQuestionnaire}
          />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [initialDraft] = useState<QuestionnaireDraft>(() =>
    loadQuestionnaireDraft(questionnaireQuestions, sections.length)
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(initialDraft.activeSectionIndex);
  const [skippedQuestions, setSkippedQuestions] = useState<SkipState>(
    initialDraft.skippedQuestions
  );
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialDraft.updatedAt);
  const [draftSaveState, setDraftSaveState] = useState<DraftSaveState>(
    initialDraft.updatedAt ? 'saved' : 'idle'
  );

  const handleSubmitQuestionnaire = (
    _values: QuestionnaireValues,
    helpers: FormikHelpers<QuestionnaireValues>
  ) => {
    // Keep the session draft after submission so the user can still revisit
    // their answers from the report screen during the same browser session.
    setGeneratedAt(new Date().toISOString());
    setIsReportVisible(true);
    helpers.setSubmitting(false);
  };

  return (
    <Formik<QuestionnaireValues>
      initialValues={initialDraft.values}
      enableReinitialize
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleSubmitQuestionnaire}
      validate={async (values) => {
        try {
          // Validation is scoped to the visible questions in the active section.
          await buildSectionSchema(
            getVisibleSectionQuestions(
              questionnaireQuestions,
              sections[activeSectionIndex].id,
              values
            )
          ).validate(values, { abortEarly: false });

          return {};
        } catch (error) {
          return mapValidationErrors(error);
        }
      }}
    >
      {(formik) => (
        <QuestionnaireScreen
          formik={formik}
          activeSectionIndex={activeSectionIndex}
          setActiveSectionIndex={setActiveSectionIndex}
          skippedQuestions={skippedQuestions}
          setSkippedQuestions={setSkippedQuestions}
          isReportVisible={isReportVisible}
          setIsReportVisible={setIsReportVisible}
          generatedAt={generatedAt}
          lastSavedAt={lastSavedAt}
          setLastSavedAt={setLastSavedAt}
          draftSaveState={draftSaveState}
          setDraftSaveState={setDraftSaveState}
          onRestartQuestionnaire={() => {
            const freshDraft = createEmptyDraft(questionnaireQuestions);

            // Starting over clears the session draft and resets the runtime state
            // so the next pass behaves exactly like a new questionnaire.
            clearQuestionnaireDraft();
            setSkippedQuestions(freshDraft.skippedQuestions);
            setActiveSectionIndex(freshDraft.activeSectionIndex);
            setGeneratedAt(null);
            setLastSavedAt(null);
            setDraftSaveState('idle');
            setIsReportVisible(false);
            formik.resetForm({ values: freshDraft.values });
          }}
        />
      )}
    </Formik>
  );
}

export default App;
