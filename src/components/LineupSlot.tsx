import type { Player } from '@/types';

interface LineupSlotProps {
  player?: Player | null;
  isCaptain?: boolean;
  isSub?: boolean;
  selected?: boolean;
  onAdd?: () => void;
  onSetCaptain?: () => void;
  onSelect?: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function LineupSlot({
  player,
  isCaptain = false,
  isSub = false,
  selected = false,
  onAdd,
  onSetCaptain,
  onSelect,
  disabled = false,
  compact = false,
}: LineupSlotProps) {
  if (!player) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="flex h-full min-h-[72px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EECC4E]/60 bg-[#083F5E]/30 transition hover:border-[#EECC4E] hover:bg-[#083F5E]/50 focus:outline-none focus:ring-2 focus:ring-[#EECC4E]"
      >
        <span className="text-3xl font-light text-[#EECC4E]">+</span>
        <span className="mt-0.5 text-xs font-medium text-[#F8ECA7]">Add player</span>
      </button>
    );
  }

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      className={`
        flex flex-col items-center rounded-xl border-2 bg-[#F79C22] p-1.5 text-center shadow-md transition
        ${isCaptain ? 'border-[#EECC4E] shadow-captain' : 'border-[#083F5E]/40'}
        ${selected ? 'ring-2 ring-[#99BFDE] ring-offset-2 ring-offset-[#083F5E]' : ''}
        ${compact ? 'min-w-0' : 'min-h-[80px]'}
        ${onSelect ? 'cursor-pointer hover:opacity-90' : ''}
      `}
    >
      {player.ImageURL ? (
        <img
          src={player.ImageURL}
          alt={player.Name}
          className="h-10 w-10 rounded-full object-cover bg-[#083F5E]/20"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#083F5E]/30 text-lg text-[#083F5E]">
          {player.IsGK ? '🧤' : '⚽'}
        </div>
      )}
      <p className="mt-1 truncate w-full max-w-[90px] text-xs font-semibold text-[#083F5E]">
        {player.Name}
      </p>
      <p className="truncate w-full max-w-[90px] text-[10px] text-[#083F5E]/80">{player.Team}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
        <span className="rounded bg-[#083F5E]/20 px-1 text-[10px] font-medium text-[#083F5E]">
          {player.TotalPoints} pts
        </span>
        {player.IsGK && (
          <span className="rounded bg-[#99BFDE]/60 px-1 text-[10px] text-[#083F5E]">GK</span>
        )}
        {isCaptain && (
          <span className="rounded bg-[#EECC4E] px-1 text-[10px] font-bold text-[#083F5E]">C</span>
        )}
      </div>
      {onSetCaptain && !isSub && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSetCaptain();
          }}
          className="mt-1 rounded bg-[#EECC4E] px-1.5 py-0.5 text-[10px] font-semibold text-[#083F5E] hover:opacity-90"
        >
          {isCaptain ? '✓ Captain' : 'Set C'}
        </button>
      )}
    </div>
  );
}
