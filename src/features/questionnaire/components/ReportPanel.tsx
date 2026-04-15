import { useEffect, useMemo, useRef } from 'react';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { FollowUpItem, QuestionnaireSummary, ReportSection } from '../types';
import { formatTimestamp } from '../utils/reportExport';

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer]);

interface ReportPanelProps {
  sections: ReportSection[];
  summary: QuestionnaireSummary;
  followUpItems: FollowUpItem[];
  isVisible: boolean;
  totalQuestions: number;
  generatedAt: string | null;
  lastSavedAt: string | null;
  onDownloadReport: () => void;
  onRestartQuestionnaire: () => void;
}

const statusBadgeClasses = {
  Answered: 'bg-emerald-100 text-emerald-700',
  Skipped: 'bg-amber-100 text-amber-700',
  Unanswered: 'bg-rose-100 text-rose-700',
  'Not applicable': 'bg-slate-200 text-slate-600'
};

function SectionCoverageChart({ sections }: { sections: ReportSection[] }) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const seriesData = useMemo(
    () => ({
      answered: sections.map((section) => section.stats.answered),
      skipped: sections.map((section) => section.stats.skipped),
      unanswered: sections.map((section) => section.stats.unanswered),
      hidden: sections.map((section) => section.stats.hidden)
    }),
    [sections]
  );

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    // Use the SVG renderer so printed reports keep crisp chart edges.
    const chart = echarts.init(chartContainerRef.current, undefined, { renderer: 'svg' });
    chart.setOption({
      color: ['#0f766e', '#d97706', '#dc2626', '#64748b'],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 12, right: 12, top: 20, bottom: 16, containLabel: true },
      legend: { bottom: 0 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } }
      },
      yAxis: {
        type: 'category',
        data: sections.map((section) => section.title)
      },
      series: [
        {
          name: 'Answered',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: seriesData.answered
        },
        {
          name: 'Skipped',
          type: 'bar',
          stack: 'total',
          data: seriesData.skipped
        },
        {
          name: 'Unanswered',
          type: 'bar',
          stack: 'total',
          data: seriesData.unanswered
        },
        {
          name: 'Not applicable',
          type: 'bar',
          stack: 'total',
          data: seriesData.hidden
        }
      ]
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [sections, seriesData]);

  return (
    <div
      ref={chartContainerRef}
      data-print="hide"
      className="h-80 w-full"
      aria-label="Questionnaire completion chart"
    />
  );
}

export function ReportPanel({
  sections,
  summary,
  followUpItems,
  isVisible,
  totalQuestions,
  generatedAt,
  lastSavedAt,
  onDownloadReport,
  onRestartQuestionnaire
}: ReportPanelProps) {
  // Only render the report after the questionnaire has been explicitly submitted.
  if (!isVisible) {
    return null;
  }

  return (
    <section
      data-print="report"
      className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8"
    >
      <div className="grid gap-6 border-b border-slate-200 pb-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
                Generated report
              </div>
              <h2 className="mt-2 font-display text-3xl text-slate-900">
                Discovery handoff summary
              </h2>
            </div>
            <div data-print="hide" className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRestartQuestionnaire}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Start new questionnaire
              </button>
              <button
                type="button"
                onClick={onDownloadReport}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Download markdown
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Print view
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            This report captures answered prompts, deferred items, and questions that were not
            triggered by the current decision path.
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Generated {formatTimestamp(generatedAt)}</span>
            {lastSavedAt ? <span>Last draft save {formatTimestamp(lastSavedAt)}</span> : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-emerald-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Answered</div>
              <div className="mt-2 font-display text-3xl text-emerald-900">{summary.answered}</div>
            </div>
            <div className="rounded-3xl bg-amber-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-amber-700">Skipped</div>
              <div className="mt-2 font-display text-3xl text-amber-900">{summary.skipped}</div>
            </div>
            <div className="rounded-3xl bg-rose-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-rose-700">Unanswered</div>
              <div className="mt-2 font-display text-3xl text-rose-900">{summary.unanswered}</div>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                  Executive snapshot
                </div>
                <div className="mt-2 font-display text-2xl text-slate-900">
                  {summary.readinessLabel}
                </div>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                Required coverage {summary.requiredAnswered}/{summary.requiredVisible}
              </div>
            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-slate-950 transition-all"
                style={{ width: `${summary.completionRate}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>{summary.completionRate}% of visible prompts answered</span>
              <span>{summary.hidden} questions excluded by the decision path</span>
            </div>
          </div>
        </div>

        <div data-print="hide" className="rounded-[28px] bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
              Section coverage
            </div>
            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {totalQuestions} questions
            </div>
          </div>
          <SectionCoverageChart sections={sections} />
        </div>
      </div>

      <div
        className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
        data-print-section
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
              Follow-up queue
            </div>
            <h3 className="mt-2 font-display text-2xl text-slate-900">
              Outstanding discovery items
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              These prompts still need clarification before delivery planning is fully locked.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            {followUpItems.length} open item{followUpItems.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {followUpItems.length === 0 ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              No open discovery items remain. This report is ready to hand off.
            </div>
          ) : (
            followUpItems.map((item) => (
              <div
                key={`${item.sectionId}-${item.questionId}`}
                data-print-row
                className="rounded-3xl border border-slate-200 bg-white px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {item.sectionTitle}
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {item.questionTitle}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[item.status]}`}
                    >
                      {item.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <article
            key={section.sectionId}
            data-print-section
            className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-2xl text-slate-900">{section.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  {section.summary}
                </p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                {section.stats.answered} answered, {section.stats.skipped} skipped,{' '}
                {section.stats.hidden} not applicable
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {section.rows.map((row) => (
                <div
                  key={row.questionId}
                  data-print-row
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{row.title}</div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">{row.answer}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[row.status]}`}
                      >
                        {row.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {row.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
