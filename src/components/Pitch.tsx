import type { Player } from '@/types';
import PlayerCard2 from './PlayerCard2';

/** Formation: 2-2-1 (FPL style, your goal at bottom). Order: [fwd1, fwd2, mid1, mid2, gk]. */
interface PitchProps {
  players: Player[];
  captainId: string;
  onSlotAdd?: () => void;
  onSetCaptain?: (playerId: string) => void;
  disabled?: boolean;
}

function orderMainPlayers(players: Player[]): (Player | null)[] {
  const gk = players.find((p) => p.IsGK) ?? null;
  const outfield = players.filter((p) => !p.IsGK);
  const slots: (Player | null)[] = [null, null, null, null, gk];
  let idx = 0;
  for (const p of outfield) {
    if (idx < 4) slots[idx++] = p;
  }
  return slots;
}

export function Pitch({
  players,
  captainId,
  onSlotAdd,
  onSetCaptain,
  disabled = false,
}: PitchProps) {
  const ordered = orderMainPlayers(players);
  const [fwd1, fwd2, mid1, mid2, gk] = ordered;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-4 border-[#083F5E] bg-gradient-to-b from-[#1b4332] via-[#2d6a4f] to-[#2d6a4f] shadow-xl z-0">
      {/* Grass stripes */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(0,0,0,0.08) 24px, rgba(0,0,0,0.08) 48px)',
        }}
      />
      {/* Pitch lines */}
      <div className="absolute inset-0 rounded-[14px] border-[3px] border-white/70" />
      <div className="absolute left-1/2 top-0 h-full w-0 border-l-2 border-dashed border-white/60" style={{ transform: 'translateX(-50%)' }} />
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60" />
      {/* Goal line (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50" />

      {/* Formation: forwards (top), midfield, GK (bottom) */}
      <div className="relative grid grid-cols-3 gap-2 p-4 pt-5 pb-5">
        {/* Row 0: 2 forwards */}
        <div className="col-span-3 flex justify-center gap-4">
          <div className="flex justify-center">
            {fwd1 ? (
              <PlayerCard2
                player={fwd1}
                isCaptain={fwd1.ID === captainId}
                onCaptain={() => onSetCaptain?.(fwd1.ID)}
                disabled={disabled}
              />
            ) : (
              <button
                type="button"
                onClick={onSlotAdd}
                className="flex h-40 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EECC4E]/60 bg-[#083F5E]/30 transition hover:border-[#EECC4E] hover:bg-[#083F5E]/50"
              >
                <span className="text-3xl font-light text-[#EECC4E]">+</span>
                <span className="text-xs font-medium text-[#F8ECA7]">Add</span>
              </button>
            )}
          </div>
          <div className="flex justify-center">
            {fwd2 ? (
              <PlayerCard2
                player={fwd2}
                isCaptain={fwd2.ID === captainId}
                onCaptain={() => onSetCaptain?.(fwd2.ID)}
                disabled={disabled}
              />
            ) : (
              <button
                type="button"
                onClick={onSlotAdd}
                className="flex h-40 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EECC4E]/60 bg-[#083F5E]/30 transition hover:border-[#EECC4E] hover:bg-[#083F5E]/50"
              >
                <span className="text-3xl font-light text-[#EECC4E]">+</span>
                <span className="text-xs font-medium text-[#F8ECA7]">Add</span>
              </button>
            )}
          </div>
        </div>
        {/* Row 1: 2 midfield */}
        <div className="col-span-3 flex justify-center gap-4">
          <div className="flex justify-center">
            {mid1 ? (
              <PlayerCard2
                player={mid1}
                isCaptain={mid1.ID === captainId}
                onCaptain={() => onSetCaptain?.(mid1.ID)}
                disabled={disabled}
              />
            ) : (
              <button
                type="button"
                onClick={onSlotAdd}
                className="flex h-40 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EECC4E]/60 bg-[#083F5E]/30 transition hover:border-[#EECC4E] hover:bg-[#083F5E]/50"
              >
                <span className="text-3xl font-light text-[#EECC4E]">+</span>
                <span className="text-xs font-medium text-[#F8ECA7]">Add</span>
              </button>
            )}
          </div>
          <div className="flex justify-center">
            {mid2 ? (
              <PlayerCard2
                player={mid2}
                isCaptain={mid2.ID === captainId}
                onCaptain={() => onSetCaptain?.(mid2.ID)}
                disabled={disabled}
              />
            ) : (
              <button
                type="button"
                onClick={onSlotAdd}
                className="flex h-40 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EECC4E]/60 bg-[#083F5E]/30 transition hover:border-[#EECC4E] hover:bg-[#083F5E]/50"
              >
                <span className="text-3xl font-light text-[#EECC4E]">+</span>
                <span className="text-xs font-medium text-[#F8ECA7]">Add</span>
              </button>
            )}
          </div>
        </div>
        {/* Row 2: GK (goal line) */}
        <div className="col-span-3 flex justify-center">
          <div className="flex justify-center">
            {gk ? (
              <PlayerCard2
                player={gk}
                isCaptain={gk.ID === captainId}
                onCaptain={() => onSetCaptain?.(gk.ID)}
                disabled={disabled}
              />
            ) : (
              <button
                type="button"
                onClick={onSlotAdd}
                className="flex h-40 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EECC4E]/60 bg-[#083F5E]/30 transition hover:border-[#EECC4E] hover:bg-[#083F5E]/50"
              >
                <span className="text-3xl font-light text-[#EECC4E]">+</span>
                <span className="text-xs font-medium text-[#F8ECA7]">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
