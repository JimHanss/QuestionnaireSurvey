import { QuestionnaireSummary, SectionDefinition, SectionStats } from '../types';
import { formatTimestamp } from '../utils/reportExport';

interface ProgressSidebarProps {
  activeSectionId: string;
  sections: SectionDefinition[];
  stats: SectionStats[];
  summary: QuestionnaireSummary;
  lastSavedAt: string | null;
  saveState: 'idle' | 'saving' | 'saved';
  onSelectSection: (sectionId: string) => void;
}

const statTone = [
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700'
];

export function ProgressSidebar({
  activeSectionId,
  sections,
  stats,
  summary,
  lastSavedAt,
  saveState,
  onSelectSection
}: ProgressSidebarProps) {
  return (
    <aside className="rounded-[30px] border border-slate-200/70 bg-white/85 p-5 shadow-panel backdrop-blur lg:sticky lg:top-6 lg:self-start">
      <div className="border-b border-slate-200 pb-4">
        <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Decision Path
        </div>
        <h2 className="mt-2 font-display text-2xl text-slate-900">Section progress</h2>
        <div className="mt-4 rounded-[24px] bg-slate-950 p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-300">
                Delivery readiness
              </div>
              <div className="mt-2 font-display text-2xl">{summary.readinessLabel}</div>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              {summary.completionRate}%
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-amber-300 transition-all"
              style={{ width: `${summary.completionRate}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
            <span>{summary.answered} answered</span>
            <span>{summary.followUpCount} follow-ups</span>
          </div>
        </div>
        <div className="mt-4 rounded-[22px] bg-slate-100 px-4 py-3 text-sm text-slate-600">
          <div className="font-medium text-slate-900">
            {saveState === 'saving' ? 'Saving draft locally...' : 'Draft saved locally'}
          </div>
          <div className="mt-1 text-xs text-slate-500">{formatTimestamp(lastSavedAt)}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {sections.map((section, index) => {
          const sectionStats = stats.find((item) => item.sectionId === section.id);
          const isActive = section.id === activeSectionId;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={`w-full rounded-[24px] border p-4 text-left transition ${
                isActive
                  ? 'border-slate-900 bg-slate-950 text-white'
                  : 'border-slate-200 bg-slate-50/80 text-slate-800 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">
                    Section {index + 1}
                  </div>
                  <div className="mt-2 font-display text-xl">{section.title}</div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive ? 'bg-white/15 text-white' : statTone[index % statTone.length]
                  }`}
                >
                  {sectionStats?.completionRate ?? 0}% answered
                </div>
              </div>
              <p className={`mt-3 text-sm leading-6 ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                {section.summary}
              </p>
              <div className={`mt-4 grid grid-cols-3 gap-2 text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                <span>{sectionStats?.answered ?? 0} ans</span>
                <span>{sectionStats?.skipped ?? 0} skip</span>
                <span>{sectionStats?.unanswered ?? 0} open</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
