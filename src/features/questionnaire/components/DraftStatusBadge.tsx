import { memo } from 'react';
import { DraftSaveState } from '../types';
import { formatTimestamp } from '../utils/reportExport';

interface DraftStatusBadgeProps {
  draftSaveState: DraftSaveState;
  lastSavedAt: string | null;
  isReportVisible: boolean;
}

export const DraftStatusBadge = memo(function DraftStatusBadge({
  draftSaveState,
  lastSavedAt,
  isReportVisible
}: DraftStatusBadgeProps) {
  const draftStatusLabel =
    draftSaveState === 'saving'
      ? 'Saving session draft...'
      : lastSavedAt
        ? 'Draft saved for this session'
        : 'No session draft saved';

  return (
    <div className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600 shadow-sm">
      {draftStatusLabel}
      {lastSavedAt && !isReportVisible ? (
        <span className="ml-2 text-slate-500">{formatTimestamp(lastSavedAt)}</span>
      ) : null}
    </div>
  );
});
