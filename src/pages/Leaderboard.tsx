import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/api';
import type { LeaderboardEntry } from '@/types';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ROUND_LABELS } from '@/types';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.viewLeaderboard({});
      if (res.success && res.data?.leaderboard) {
        setEntries((res.data.leaderboard as LeaderboardEntry[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EECC4E]">Leaderboard</h1>
      {loading ? (
        <LoadingSpinner message="Loading leaderboard..." />
      ) : (
        <div className="space-y-3">
          {entries.map((e, i) => (
            <Card key={e.UserID} className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    i === 0 ? 'bg-[#EECC4E] text-[#083F5E]' : 'bg-[#083F5E]/30 text-[#F8ECA7]'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-[#083F5E]">{e.TeamName}</p>
                  <p className="text-sm text-[#083F5E]/80">{e.Name}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-[#083F5E]">{e.TotalPoints} pts</p>
                <div className="flex flex-wrap gap-1 text-xs text-[#083F5E]/70">
                  {(['Day1', 'Day2', 'Day3', 'QF', 'SF', 'Final'] as const).map((key, idx) => (
                    <span key={key}>{ROUND_LABELS[idx + 1]}: {e[key] ?? 0}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!loading && entries.length === 0 && (
        <Card>
          <p className="text-[#083F5E]">No leaderboard yet.</p>
        </Card>
      )}
    </div>
  );
}
