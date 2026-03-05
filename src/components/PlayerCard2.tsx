import type { Player } from '@/types';
// Default placeholder image
const PLACEHOLDER_IMAGE = '/Asset 6.png';

/** Converts Google Drive share links to embeddable image URLs */
function toImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return trimmed;
}

interface PlayerCard2Props {
  player: Player;
  isCaptain?: boolean;
  isSub?: boolean;
  onSelect?: () => void;
  onCaptain?: () => void;
  selected?: boolean;
  disabled?: boolean;
  actionLabel?: string;
}

export default function PlayerCard2({
  player,
  isCaptain = false,
  isSub = false,
  onSelect,
  onCaptain,
  selected,
  disabled,
  // actionLabel,
}: PlayerCard2Props) {
  return (
    <div
      onClick={disabled ? undefined : onSelect}
      className={`
        relative w-28 h-40 rounded-2xl p-2 flex flex-col justify-center items-center 
        text-white cursor-pointer shadow-xl border-2 transition-transform duration-300
        bg-gradient-to-b from-primary-blue via-gray-900 to-primary-blue
        ${
          selected
            ? "border-primary-gold scale-105"
            : "border-white/10 hover:border-primary-gold"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {player ? (
        <>
          {/* HagmaXLama logo top-left */}
          <img
            src={PLACEHOLDER_IMAGE}
            alt="Asset 6"
            className="absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none select-none"
          />

          {/* Captain Star top-right */}
          {isCaptain && (
            <div className="absolute top-1 right-1">
              <span className="text-accent-sky text-lg">★</span>
            </div>
          )}

          {/* Player image */}
          <img
            src={player.ImageURL ? toImageUrl(player.ImageURL) : ''}
            alt={player.Name}
            className="w-16 h-16 rounded-full object-cover mb-1 bg-[#083F5E]/30"
          />

          {/* Player Name */}
          <div className="text-xs text-accent-sky text-center font-semibold mb-1">
            {player.Name}
          </div>

          {/* Bottom Row Info - in flow, always visible */}
          <div className="mt-auto w-full flex items-end justify-between gap-1 text-[10px] text-white leading-tight">
            <div className="min-w-0 flex-1 text-left">
              <div className="break-words">{player.Team}</div>
              <div className="text-gray-400 italic">{player.IsGK ? "GK" : "Player"}</div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div>Round: {player.Day1 ?? 0}</div>
              <div>Total: {player.TotalPoints ?? 0}</div>
            </div>
          </div>

          {/* Captain Button */}
          {onCaptain && !isSub && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCaptain();
              }}
              className="mt-2 rounded bg-[#EECC4E] px-2 py-1 text-[10px] font-semibold text-[#083F5E] hover:opacity-90 transition"
            >
              {isCaptain ? '✓ Captain' : 'Set C'}
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl text-gray-400">+</div>
          <div className="text-xs mt-1 text-gray-500 text-center">
            Add Player
          </div>
        </div>
      )}
    </div>
  );
}