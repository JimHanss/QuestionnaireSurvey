import { memo } from 'react';
import { DraftSaveState } from '../types';
import { DraftStatusBadge } from './DraftStatusBadge';

interface QuestionnaireHeaderProps {
  draftSaveState: DraftSaveState;
  lastSavedAt: string | null;
  isReportVisible: boolean;
}

export const QuestionnaireHeader = memo(function QuestionnaireHeader({
  draftSaveState,
  lastSavedAt,
  isReportVisible
}: QuestionnaireHeaderProps) {
  return (
    <header data-print="hide" className="px-1 py-1">
      <div className="flex items-end justify-between gap-4">
        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-[3.3rem] sm:leading-none">
          Requirements Navigator
        </h1>
        <DraftStatusBadge
          draftSaveState={draftSaveState}
          lastSavedAt={lastSavedAt}
          isReportVisible={isReportVisible}
        />
      </div>
    </header>
  );
});
