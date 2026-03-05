import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRound } from '@/context/RoundContext';
import { api } from '@/api/api';
import type { Player } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Pitch } from '@/components/Pitch';
import { Bench } from '@/components/Bench';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state: roundState } = useRound();
  const [players, setPlayers] = useState<Player[]>([]);
  const [subs, setSubs] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectingCaptain, setSelectingCaptain] = useState(false);
  const [subOutId, setSubOutId] = useState<string | null>(null);
  const [subInId, setSubInId] = useState<string | null>(null);
  const [submittingSub, setSubmittingSub] = useState(false);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await api.viewMyPlayers({ userId: user.userId });
      if (res.success && res.data) {
        setPlayers((res.data.players as Player[]) ?? []);
        setSubs((res.data.subs as Player[]) ?? []);
        setCaptainId(res.data.captainId ?? '');
      }
    } catch {
      setMessage('Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const setCaptain = async (playerId: string) => {
    if (!user?.userId || roundState?.MatchInPlay) return;
    if (playerId === captainId) return;
    setSelectingCaptain(true);
    setMessage('');
    try {
      const res = await api.selectCaptain({ userId: user.userId, captainId: playerId });
      if (res.success) {
        setCaptainId(playerId);
        setMessage('Captain set');
      } else {
        setMessage(res.error ?? 'Failed to set captain');
      }
    } catch {
      setMessage('Request error');
    } finally {
      setSelectingCaptain(false);
    }
  };

  const locked = roundState?.MatchInPlay ?? false;
  const canSub = roundState?.AllowSubs && !roundState?.MatchInPlay;
  const totalPoints = players.reduce((sum, p) => sum + (p.TotalPoints || 0), 0);

  const doSubstitute = async () => {
    if (!user?.userId || !subOutId || !subInId) return;
    setSubmittingSub(true);
    setMessage('');
    try {
      const res = await api.substitutePlayer({
        userId: user.userId,
        outPlayerId: subOutId,
        inPlayerId: subInId,
      });
      if (res.success) {
        setMessage('Substitution done');
        setSubOutId(null);
        setSubInId(null);
        load();
      } else {
        setMessage(res.error ?? 'Substitution failed');
      }
    } catch {
      setMessage('Request error');
    } finally {
      setSubmittingSub(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#EECC4E]">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-[#F8ECA7]">
          {roundState?.MatchInPlay && (
            <span className="rounded bg-[#A71F26] px-2 py-1">Match in play – no changes</span>
          )}
          {roundState?.TransferWindow && (
            <span className="rounded bg-[#99BFDE]/30 px-2 py-1 text-[#083F5E]">Transfer window open</span>
          )}
        </div>
      </div>

      <Card>
        <p className="font-semibold text-[#083F5E]">{user?.teamName}</p>
        <p className="text-sm text-[#083F5E]/80">Manager: {user?.name}</p>
      </Card>

      {user?.isAdmin && (
        <Card className="border-2 border-[#EECC4E]">
          <p className="font-semibold text-[#083F5E]">Admin access</p>
          <p className="text-sm text-[#083F5E]/80">You can manage rounds, stats, and leaderboard.</p>
          <Link to="/admin" className="mt-2 inline-block">
            <Button variant="primary" className="!py-1.5 text-sm">Open Admin Panel</Button>
          </Link>
        </Card>
      )}

      {message && (
        <p className={`text-sm ${(message === 'Captain set' || message === 'Substitution done') ? 'text-[#083F5E]' : 'text-[#A71F26]'}`}>
          {message}
        </p>
      )}

      {loading ? (
        <LoadingSpinner message="Loading your team..." />
      ) : (
        <>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#083F5E]/80">My Points</p>
                <p className="text-3xl font-bold text-[#EECC4E]">{totalPoints}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </Card>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#F8ECA7]">My Team</h2>
            <Pitch
              players={players}
              captainId={captainId}
              onSlotAdd={() => navigate('/players')}
              onSetCaptain={!locked && !selectingCaptain ? setCaptain : undefined}
              disabled={locked}
            />
            {players.length < 5 && (
              <p className="mt-2 text-center text-sm text-[#F8ECA7]/80">
                Tap a <span className="font-bold text-[#EECC4E]">+</span> on the pitch to add a player from the market.
              </p>
            )}
          </section>

          <section>
            <Bench
            subs={subs}
            onAdd={() => navigate('/players')}
            selectedSubId={subInId}
            onSelectSub={canSub && subOutId ? (id) => setSubInId(subInId === id ? null : id) : undefined}
            disabled={locked}
            disableAdd={players.length < 5}
          />
          </section>

          {canSub && players.length > 0 && subs.length > 0 && (
            <Card>
              <h2 className="mb-3 font-semibold text-[#083F5E]">Substitute (swap with bench)</h2>
              <p className="mb-2 text-sm text-[#083F5E]/80">Pick a starting player to bench, then a sub to bring on.</p>
              <div className="mb-2 flex flex-wrap gap-2">
                {players.map((p) => (
                  <button
                    key={p.ID}
                    type="button"
                    onClick={() => p.ID !== captainId && setSubOutId(subOutId === p.ID ? null : p.ID)}
                    disabled={p.ID === captainId}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      subOutId === p.ID ? 'bg-[#EECC4E] text-[#083F5E]' : 'bg-[#083F5E]/20 text-[#083F5E]'
                    } ${p.ID === captainId ? 'opacity-50' : ''}`}
                  >
                    {p.Name} {p.ID === captainId ? '(Captain)' : ''}
                  </button>
                ))}
              </div>
              {subOutId && subInId && (
                <Button onClick={doSubstitute} loading={submittingSub} disabled={submittingSub}>
                  Confirm substitution
                </Button>
              )}
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Link to="/players">
              <Button variant="secondary">Player Market</Button>
            </Link>
            <Link to="/transfers">
              <Button variant="primary">Transfers</Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="ghost">Leaderboard</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
