import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/api';
import type { Player } from '@/types';
import { Card } from '@/components/Card';
// import { PlayerCard } from '@/components/PlayerCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import PlayerCard2 from '@/components/PlayerCard2';

export function PlayerMarket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.viewAllPlayers({});
      if (res.success && res.data?.players) {
        setPlayers((res.data.players as Player[]) ?? []);
      } else {
        setPlayers([]);
        setMessage(res.error ?? 'Failed to load players');
      }
    } catch (e) {
      setPlayers([]);
      setMessage((e as Error).message || 'Failed to load players');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPlayer = async (playerId: string) => {
    if (!user?.userId) return;
    setAddingId(playerId);
    setMessage('');
    try {
      const res = await api.addPlayerToTeam({ userId: user.userId, playerId });
      if (res.success) {
        setMessage('Player added');
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        setMessage(res.error ?? 'Add failed');
      }
    } catch {
      setMessage('Request error');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EECC4E]">Player Market</h1>
      {message && (
        <p className={`text-sm ${message === 'Player added' ? 'text-[#EECC4E]' : 'text-[#A71F26]'}`}>
          {message}
        </p>
      )}
      {loading ? (
        <LoadingSpinner message="Loading players..." />
      ) : (
        <div className="grid w-fit max-w-full grid-cols-3 gap-3">
          {players.map((p) => (
            <PlayerCard2
              key={p.ID}
              player={p}
              onSelect={() => addPlayer(p.ID)}
              disabled={addingId !== null}
              actionLabel={addingId === p.ID ? 'Adding...' : 'Add to team'}
            />
          ))}
        </div>
      )}
      {!loading && players.length === 0 && (
        <Card>
          <p className="text-[#083F5E]">No players in the market yet.</p>
        </Card>
      )}
    </div>
  );
}
