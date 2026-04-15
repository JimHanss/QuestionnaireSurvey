import { memo } from 'react';
import { AnswerValue, QuestionDefinition } from '../types';

interface QuestionCardProps {
  question: QuestionDefinition;
  value: AnswerValue;
  displayIndex: number;
  visibleCount: number;
  error?: string;
  touched?: boolean;
  skipped: boolean;
  onChange: (questionId: string, value: AnswerValue) => void;
  onBlur: (questionId: string) => void;
  onSkip: (question: QuestionDefinition) => void;
}

const statusBadgeClasses = {
  required: 'bg-rose-100 text-rose-700',
  optional: 'bg-slate-100 text-slate-600',
  skipped: 'bg-amber-100 text-amber-700'
};

const areAnswerValuesEqual = (left: AnswerValue, right: AnswerValue): boolean => {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length && left.every((value, index) => value === right[index])
    );
  }

  return left === right;
};

const QuestionCardComponent = ({
  question,
  value,
  displayIndex,
  visibleCount,
  error,
  touched,
  skipped,
  onChange,
  onBlur,
  onSkip
}: QuestionCardProps) => {
  const textValue = Array.isArray(value) ? value.join(', ') : value;

  const renderInputField = () => {
    if (question.type === 'textarea') {
      return (
        <textarea
          rows={4}
          value={textValue}
          placeholder={question.placeholder}
          onBlur={() => onBlur(question.id)}
          onChange={(event) => onChange(question.id, event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        />
      );
    }

    if (question.type === 'text') {
      return (
        <input
          type="text"
          value={textValue}
          placeholder={question.placeholder}
          onBlur={() => onBlur(question.id)}
          onChange={(event) => onChange(question.id, event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        />
      );
    }

    if (question.type === 'select') {
      return (
        <select
          value={Array.isArray(value) ? '' : value}
          onBlur={() => onBlur(question.id)}
          onChange={(event) => onChange(question.id, event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        >
          {question.options?.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (question.type === 'radio') {
      return (
        <div className="grid gap-3">
          {question.options?.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300"
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={!Array.isArray(value) && value === option.value}
                onBlur={() => onBlur(question.id)}
                onChange={(event) => onChange(question.id, event.target.value)}
                className="mt-1 h-4 w-4 border-slate-400 text-slate-900 focus:ring-slate-900"
              />
              <div>
                <div className="font-semibold text-slate-900">{option.label}</div>
                {option.note ? <div className="text-sm text-slate-500">{option.note}</div> : null}
              </div>
            </label>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-3">
        {question.options?.map((option) => {
          const selectedValues = Array.isArray(value) ? value : [];
          const isSelected = selectedValues.includes(option.value);

          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onBlur={() => onBlur(question.id)}
                onChange={(event) => {
                  const nextValue = event.target.checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((item) => item !== option.value);
                  onChange(question.id, nextValue);
                }}
                className="mt-1 h-4 w-4 rounded border-slate-400 text-slate-900 focus:ring-slate-900"
              />
              <div>
                <div className="font-semibold text-slate-900">{option.label}</div>
                {option.note ? <div className="text-sm text-slate-500">{option.note}</div> : null}
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <article className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Q{displayIndex} of {visibleCount}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                question.required
                  ? statusBadgeClasses.required
                  : statusBadgeClasses.optional
              }`}
            >
              {question.required ? 'Required' : 'Optional'}
            </span>
            {question.visibleWhen ? (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                Conditional path
              </span>
            ) : null}
            {skipped ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses.skipped}`}
              >
                Skipped
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">{question.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{question.helperText}</p>
          </div>
        </div>

        {question.skippable ? (
          <button
            type="button"
            onClick={() => onSkip(question)}
            className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
          >
            Skip for now
          </button>
        ) : null}
      </div>

      <div className="mt-4">{renderInputField()}</div>

      {touched && error ? (
        <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>
      ) : skipped ? (
        <p className="mt-3 text-sm font-medium text-amber-700">
          This answer has been marked for follow-up in the final report.
        </p>
      ) : null}
    </article>
  );
};

export const QuestionCard = memo(
  QuestionCardComponent,
  (previousProps, nextProps) =>
    previousProps.question === nextProps.question &&
    previousProps.displayIndex === nextProps.displayIndex &&
    previousProps.visibleCount === nextProps.visibleCount &&
    previousProps.error === nextProps.error &&
    previousProps.touched === nextProps.touched &&
    previousProps.skipped === nextProps.skipped &&
    previousProps.onChange === nextProps.onChange &&
    previousProps.onBlur === nextProps.onBlur &&
    previousProps.onSkip === nextProps.onSkip &&
    areAnswerValuesEqual(previousProps.value, nextProps.value)
);
