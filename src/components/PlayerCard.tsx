import type { Player } from '@/types';
import { Card } from './Card';

interface PlayerCardProps {
  player: Player;
  isCaptain?: boolean;
  isSub?: boolean;
  onSelect?: () => void;
  onCaptain?: () => void;
  selected?: boolean;
  disabled?: boolean;
  actionLabel?: string;
}

export function PlayerCard({
  player,
  isCaptain = false,
  isSub = false,
  onSelect,
  onCaptain,
  selected,
  disabled,
  actionLabel,
}: PlayerCardProps) {
  return (
    <Card
      hover={!disabled}
      className={`
        relative overflow-hidden
        ${isCaptain ? 'shadow-captain ring-2 ring-[#EECC4E]' : ''}
        ${selected ? 'ring-2 ring-[#99BFDE]' : ''}
        ${disabled ? 'opacity-70' : ''}
      `}
    >
      <img
        src="/public/Asset 6.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 h-8 w-8 opacity-90"
      />
      <div className="flex items-center gap-3">
        {player.ImageURL ? (
          <img
            src={player.ImageURL}
            alt={player.Name}
            className="h-14 w-14 rounded-full object-cover bg-[#083F5E]/20"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#083F5E]/30 text-xl text-[#083F5E]">
            {player.IsGK ? '🧤' : '⚽'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#083F5E] truncate">{player.Name}</p>
          <p className="text-sm text-[#083F5E]/80">{player.Team}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-[#083F5E]/20 px-1.5 py-0.5 text-xs font-medium text-[#083F5E]">
              {player.TotalPoints} pts
            </span>
            {player.IsGK && (
              <span className="rounded bg-[#99BFDE]/50 px-1.5 py-0.5 text-xs text-[#083F5E]">GK</span>
            )}
            {isCaptain && (
              <span className="rounded bg-[#EECC4E] px-1.5 py-0.5 text-xs font-bold text-[#083F5E]">
                Captain
              </span>
            )}
            {isSub && (
              <span className="rounded bg-[#083F5E]/40 px-1.5 py-0.5 text-xs text-[#083F5E]">Sub</span>
            )}
          </div>
        </div>
      </div>
      {(onSelect || onCaptain) && !disabled && (
        <div className="mt-3 flex gap-2">
          {onCaptain && !isSub && (
            <button
              type="button"
              onClick={onCaptain}
              className="rounded-lg bg-[#EECC4E] px-3 py-1.5 text-sm font-medium text-[#083F5E] hover:opacity-90"
            >
              {isCaptain ? 'Captain ✓' : 'Set captain'}
            </button>
          )}
          {onSelect && (
            <button
              type="button"
              onClick={onSelect}
              className="rounded-lg bg-[#99BFDE] px-3 py-1.5 text-sm font-medium text-[#083F5E] hover:opacity-90"
            >
              {actionLabel ?? (selected ? 'Selected' : 'Select')}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
