import * as Yup from 'yup';
import {
  AnswerValue,
  FollowUpItem,
  QuestionDefinition,
  QuestionnaireSummary,
  QuestionnaireValues,
  ReportQuestionRow,
  ReportSection,
  SectionDefinition,
  SectionStats,
  SkipState
} from '../types';

interface DerivedQuestionState {
  isVisible: boolean;
  isAnswered: boolean;
  row: ReportQuestionRow;
}

interface QuestionnaireDerivedState {
  visibleQuestionsBySectionId: Record<string, QuestionDefinition[]>;
  sectionStatsBySectionId: Record<string, SectionStats>;
  reportSections: ReportSection[];
  followUpItems: FollowUpItem[];
  summary: QuestionnaireSummary;
}

export const hasAnswer = (value: AnswerValue): boolean => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value.trim().length > 0;
};

export const isQuestionVisible = (
  question: QuestionDefinition,
  values: QuestionnaireValues
): boolean => {
  if (!question.visibleWhen) {
    return true;
  }

  const currentValue = values[question.visibleWhen.questionId];

  if (question.visibleWhen.operator === 'equals') {
    return currentValue === question.visibleWhen.value;
  }

  if (!Array.isArray(currentValue)) {
    return false;
  }

  return Array.isArray(question.visibleWhen.value)
    ? question.visibleWhen.value.every((value) => currentValue.includes(value))
    : currentValue.includes(question.visibleWhen.value);
};

export const getVisibleSectionQuestions = (
  questions: QuestionDefinition[],
  sectionId: string,
  values: QuestionnaireValues
): QuestionDefinition[] =>
  questions.filter(
    (question) => question.sectionId === sectionId && isQuestionVisible(question, values)
  );

export const buildSectionSchema = (questions: QuestionDefinition[]) => {
  const shape = questions.reduce<Record<string, Yup.AnySchema>>((accumulator, question) => {
    if (question.type === 'checkbox') {
      accumulator[question.id] = question.required
        ? Yup.array()
            .of(Yup.string().required())
            .min(1, 'Please select at least one option.')
        : Yup.array().of(Yup.string().required());

      return accumulator;
    }

    accumulator[question.id] = question.required
      ? Yup.string().trim().required('This question is required.')
      : Yup.string().trim();

    return accumulator;
  }, {});

  return Yup.object(shape);
};

const formatAnswer = (value: AnswerValue): string => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'No answer provided';
  }

  return value.trim().length > 0 ? value : 'No answer provided';
};

const deriveQuestionState = (
  question: QuestionDefinition,
  values: QuestionnaireValues,
  skippedQuestions: SkipState
): DerivedQuestionState => {
  const isVisible = isQuestionVisible(question, values);

  if (!isVisible) {
    return {
      isVisible: false,
      isAnswered: false,
      row: {
        questionId: question.id,
        title: question.title,
        status: 'Not applicable',
        answer: 'This question was not part of the active decision path.',
        required: question.required
      }
    };
  }

  const answer = values[question.id];
  const isAnswered = hasAnswer(answer);

  if (isAnswered) {
    return {
      isVisible: true,
      isAnswered: true,
      row: {
        questionId: question.id,
        title: question.title,
        status: 'Answered',
        answer: formatAnswer(answer),
        required: question.required
      }
    };
  }

  if (skippedQuestions[question.id]) {
    return {
      isVisible: true,
      isAnswered: false,
      row: {
        questionId: question.id,
        title: question.title,
        status: 'Skipped',
        answer: 'The team chose to defer this answer during discovery.',
        required: question.required
      }
    };
  }

  return {
    isVisible: true,
    isAnswered: false,
    row: {
      questionId: question.id,
      title: question.title,
      status: 'Unanswered',
      answer: 'No answer was captured yet.',
      required: question.required
    }
  };
};

const getReadinessLabel = (
  requiredVisible: number,
  requiredAnswered: number,
  answered: number,
  skipped: number,
  followUpCount: number
): QuestionnaireSummary['readinessLabel'] => {
  if (requiredVisible > 0 && requiredAnswered === requiredVisible) {
    return followUpCount > 0 ? 'In progress' : 'Ready for handoff';
  }

  if (answered > 0 || skipped > 0) {
    return 'In progress';
  }

  return 'Needs input';
};

export const buildQuestionnaireDerivedState = (
  sections: SectionDefinition[],
  questions: QuestionDefinition[],
  values: QuestionnaireValues,
  skippedQuestions: SkipState
): QuestionnaireDerivedState => {
  const questionsBySectionId = questions.reduce<Record<string, QuestionDefinition[]>>(
    (groupedQuestions, question) => {
      if (!groupedQuestions[question.sectionId]) {
        groupedQuestions[question.sectionId] = [];
      }

      groupedQuestions[question.sectionId].push(question);
      return groupedQuestions;
    },
    {}
  );

  const visibleQuestionsBySectionId: Record<string, QuestionDefinition[]> = {};
  const sectionStatsBySectionId: Record<string, SectionStats> = {};
  const reportSections: ReportSection[] = [];
  const followUpItems: FollowUpItem[] = [];

  let answeredCount = 0;
  let skippedCount = 0;
  let unansweredCount = 0;
  let hiddenCount = 0;
  let totalVisible = 0;
  let requiredVisible = 0;
  let requiredAnswered = 0;

  sections.forEach((section) => {
    const sectionQuestions = questionsBySectionId[section.id] ?? [];
    const visibleQuestions: QuestionDefinition[] = [];
    const rows: ReportQuestionRow[] = [];

    const sectionCounts = {
      answered: 0,
      skipped: 0,
      unanswered: 0,
      hidden: 0
    };

    sectionQuestions.forEach((question) => {
      const derivedQuestionState = deriveQuestionState(question, values, skippedQuestions);

      rows.push(derivedQuestionState.row);

      if (!derivedQuestionState.isVisible) {
        sectionCounts.hidden += 1;
        hiddenCount += 1;
        return;
      }

      visibleQuestions.push(question);
      totalVisible += 1;

      if (question.required) {
        requiredVisible += 1;
      }

      if (derivedQuestionState.isAnswered) {
        sectionCounts.answered += 1;
        answeredCount += 1;

        if (question.required) {
          requiredAnswered += 1;
        }

        return;
      }

      if (derivedQuestionState.row.status === 'Skipped') {
        sectionCounts.skipped += 1;
        skippedCount += 1;
      } else {
        sectionCounts.unanswered += 1;
        unansweredCount += 1;
      }

      followUpItems.push({
        sectionId: section.id,
        sectionTitle: section.title,
        questionId: derivedQuestionState.row.questionId,
        questionTitle: derivedQuestionState.row.title,
        status: derivedQuestionState.row.status as 'Skipped' | 'Unanswered',
        required: derivedQuestionState.row.required,
        answer: derivedQuestionState.row.answer
      });
    });

    const sectionStats: SectionStats = {
      sectionId: section.id,
      total: sectionQuestions.length,
      answered: sectionCounts.answered,
      skipped: sectionCounts.skipped,
      hidden: sectionCounts.hidden,
      unanswered: sectionCounts.unanswered,
      completionRate:
        sectionQuestions.length === 0
          ? 0
          : Math.round((sectionCounts.answered / sectionQuestions.length) * 100)
    };

    visibleQuestionsBySectionId[section.id] = visibleQuestions;
    sectionStatsBySectionId[section.id] = sectionStats;
    reportSections.push({
      sectionId: section.id,
      title: section.title,
      summary: section.summary,
      stats: sectionStats,
      rows
    });
  });

  const summary: QuestionnaireSummary = {
    totalQuestions: questions.length,
    totalVisible,
    answered: answeredCount,
    skipped: skippedCount,
    unanswered: unansweredCount,
    hidden: hiddenCount,
    completionRate: totalVisible === 0 ? 0 : Math.round((answeredCount / totalVisible) * 100),
    requiredAnswered,
    requiredVisible,
    followUpCount: followUpItems.length,
    readinessLabel: getReadinessLabel(
      requiredVisible,
      requiredAnswered,
      answeredCount,
      skippedCount,
      followUpItems.length
    )
  };

  return {
    visibleQuestionsBySectionId,
    sectionStatsBySectionId,
    reportSections,
    followUpItems,
    summary
  };
};

export const getSectionStats = (
  sectionId: string,
  questions: QuestionDefinition[],
  values: QuestionnaireValues,
  skippedQuestions: SkipState
): SectionStats => {
  const sectionQuestions = questions.filter((question) => question.sectionId === sectionId);

  const section = {
    id: sectionId,
    title: sectionId,
    summary: ''
  };

  return buildQuestionnaireDerivedState([section], sectionQuestions, values, skippedQuestions)
    .sectionStatsBySectionId[sectionId];
};

export const getReportSections = (
  sections: SectionDefinition[],
  questions: QuestionDefinition[],
  values: QuestionnaireValues,
  skippedQuestions: SkipState
): ReportSection[] =>
  buildQuestionnaireDerivedState(sections, questions, values, skippedQuestions).reportSections;

export const getFollowUpItems = (
  sections: SectionDefinition[],
  questions: QuestionDefinition[],
  values: QuestionnaireValues,
  skippedQuestions: SkipState
): FollowUpItem[] =>
  buildQuestionnaireDerivedState(sections, questions, values, skippedQuestions).followUpItems;

export const getQuestionnaireSummary = (
  sections: SectionDefinition[],
  questions: QuestionDefinition[],
  values: QuestionnaireValues,
  skippedQuestions: SkipState
): QuestionnaireSummary =>
  buildQuestionnaireDerivedState(sections, questions, values, skippedQuestions).summary;
