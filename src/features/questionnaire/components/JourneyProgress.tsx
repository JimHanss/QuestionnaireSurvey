import { SectionDefinition } from '../types';

interface JourneyProgressProps {
  activeSectionId: string;
  sections: SectionDefinition[];
  isReportComplete: boolean;
  onSelectSection: (sectionId: string) => void;
}

export function JourneyProgress({
  activeSectionId,
  sections,
  isReportComplete,
  onSelectSection
}: JourneyProgressProps) {
  const activeSectionIndex = sections.findIndex((section) => section.id === activeSectionId);
  const trackInsetPercent = 50 / sections.length;
  const completedTrackWidth =
    sections.length > 1 ? `${(activeSectionIndex * 100) / sections.length}%` : '0%';

  return (
    <section
      data-print="hide"
      className="rounded-[30px] border border-slate-200/70 bg-white/90 px-2 py-4 shadow-panel backdrop-blur sm:px-3 sm:py-5"
    >
      <div className="overflow-x-auto">
        <div className="relative min-w-[1180px] pt-1">
          {/* Align the baseline to the center of each station circle so the route stays visually balanced. */}
          <div
            className="absolute top-[62px] h-[2px] rounded-full bg-slate-200"
            style={{
              left: `${trackInsetPercent}%`,
              right: `${trackInsetPercent}%`
            }}
          />
          <div
            className="absolute top-[62px] h-[2px] rounded-full bg-emerald-500 transition-all"
            style={{
              left: `${trackInsetPercent}%`,
              width: completedTrackWidth
            }}
          />

          <div className="flex items-start">
            {sections.map((section, index) => {
              const isActiveStation = !isReportComplete && section.id === activeSectionId;
              const isCompletedStation =
                index < activeSectionIndex || (isReportComplete && index === activeSectionIndex);
              const stationBadgeClass = isActiveStation
                ? 'border-[#c58d00] bg-[#fde68a] text-[#7c5a00]'
                : isCompletedStation
                  ? 'border-emerald-600 bg-emerald-100 text-emerald-700'
                  : 'border-slate-300 bg-white text-slate-500';
              const stationTitleClass = isActiveStation ? 'text-slate-950' : 'text-slate-700';

              return (
                <button
                  key={section.id}
                  type="button"
                  disabled={isReportComplete}
                  onClick={() => onSelectSection(section.id)}
                  className="group relative flex-1 px-1 text-center transition disabled:cursor-default"
                >
                  <div className="min-h-[34px]">
                    <div className={`font-display text-[1.1rem] font-medium ${stationTitleClass}`}>
                      {section.title}
                    </div>
                  </div>

                  <div className="relative mt-2 flex h-10 items-center justify-center">
                    <span
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold shadow-sm transition ${stationBadgeClass}`}
                    >
                      {isCompletedStation ? '\u2713' : index + 1}
                    </span>
                  </div>

                  <p
                    className="mx-auto mt-3 max-w-[360px] text-[15px] leading-7 text-slate-600"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {section.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
