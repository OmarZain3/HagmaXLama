import type { Player } from '@/types';
import PlayerCard2 from './PlayerCard2';

const BENCH_SIZE = 2;

interface BenchProps {
  subs: Player[];
  onAdd?: () => void;
  selectedSubId?: string | null;
  onSelectSub?: (playerId: string) => void;
  disabled?: boolean;
  disableAdd?: boolean;
}

export function Bench({
  subs,
  onAdd,
  selectedSubId = null,
  onSelectSub,
  disabled = false,
  disableAdd = false,
}: BenchProps) {
  const slots: (Player | null)[] = [...subs];
  while (slots.length < BENCH_SIZE) slots.push(null);

  return (
    <div className="rounded-xl border-2 border-[#083F5E]/50 bg-[#083F5E]/20 p-3">
      <p className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-[#F8ECA7]">
        Bench
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        {slots.slice(0, BENCH_SIZE).map((player, i) => (
          player ? (
            <PlayerCard2
              key={player.ID}
              player={player}
              isSub
              selected={selectedSubId === player.ID}
              onSelect={onSelectSub && !disabled ? () => onSelectSub(player.ID) : undefined}
              disabled={disabled}
            />
          ) : (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={onAdd}
              disabled={disableAdd}
              className={`flex h-40 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                disableAdd
                  ? 'border-[#EECC4E]/30 bg-[#083F5E]/10 cursor-not-allowed opacity-50'
                  : 'border-[#EECC4E]/60 bg-[#083F5E]/30 hover:border-[#EECC4E] hover:bg-[#083F5E]/50'
              }`}
            >
              <span className="text-3xl font-light text-[#EECC4E]">+</span>
              <span className="text-xs font-medium text-[#F8ECA7]">Add</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
}
