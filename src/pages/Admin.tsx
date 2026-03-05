import React, { useEffect, useState } from 'react';
import { useRound } from '@/context/RoundContext';
import { api } from '@/api/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
export function Admin() {
  const { state: roundState, refetch } = useRound();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeRound, setActiveRound] = useState(1);
  const [matchInPlay, setMatchInPlay] = useState(false);
  const [transferWindow, setTransferWindow] = useState(false);
  const [allowSubs, setAllowSubs] = useState(false);
  const [stats, setStats] = useState({
    round: 1,
    playerId: '',
    goals: 0,
    assists: 0,
    cleanSheet: 0,
    yc: 0,
    secondYc: 0,
    rc: 0,
    penSave: 0,
    penGoal: 0,
    penMiss: 0,
    ownGoal: 0,
    conceded: 0,
  });

  useEffect(() => {
    if (roundState) {
      setActiveRound(roundState.ActiveRound || 1);
      setMatchInPlay(roundState.MatchInPlay);
      setTransferWindow(roundState.TransferWindow);
      setAllowSubs(roundState.AllowSubs);
    }
  }, [roundState]);

  const toggleState = async (field: string, value: boolean | number) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.toggleRoundState({ [field]: value });
      if (res.success) {
        setMessage(res.message ?? 'Done');
        refetch();
      } else {
        setMessage(res.error ?? 'Failed');
      }
    } catch {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  const submitStats = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate playerId is provided
    if (!stats.playerId.trim()) {
      setMessage('Please enter a Player ID');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await api.adminUpdateStats({
        round: stats.round,
        playerId: stats.playerId,
        goals: stats.goals,
        assists: stats.assists,
        cleanSheet: stats.cleanSheet,
        yc: stats.yc,
        secondYc: stats.secondYc,
        rc: stats.rc,
        penSave: stats.penSave,
        penGoal: stats.penGoal,
        penMiss: stats.penMiss,
        ownGoal: stats.ownGoal,
        conceded: stats.conceded,
      });
      if (res.success) {
        setMessage('Stats saved');
        setStats((s) => ({ ...s, playerId: '', goals: 0, assists: 0, cleanSheet: 0, yc: 0, secondYc: 0, rc: 0, penSave: 0, penGoal: 0, penMiss: 0, ownGoal: 0, conceded: 0 }));
      } else {
        setMessage(res.error ?? 'Failed');
      }
    } catch {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  const updateLeaderboard = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.updateLeaderboard({});
      if (res.success) {
        setMessage('Leaderboard updated');
      } else {
        setMessage(res.error ?? 'Failed');
      }
    } catch {
      setMessage('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EECC4E]">Admin Panel</h1>
      {message && (
        <p className={`text-sm ${(message === 'Done' || message === 'Stats saved' || message === 'Leaderboard updated' || (message && !message.includes('Failed') && !message.includes('Error'))) ? 'text-[#EECC4E]' : 'text-[#A71F26]'}`}>
          {message}
        </p>
      )}

      <Card>
        <h2 className="mb-3 font-semibold text-[#083F5E]">Current state</h2>
        <p className="text-sm text-[#083F5E]">
          Active round: {roundState?.ActiveRound ?? '-'} | Match in play: {roundState?.MatchInPlay ? 'Yes' : 'No'} |
          Transfer window: {roundState?.TransferWindow ? 'Open' : 'Closed'} | Allow subs: {roundState?.AllowSubs ? 'Yes' : 'No'}
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-[#083F5E]">Round control</h2>
        <div className="flex flex-wrap gap-2">
          <Input
            type="number"
            min={1}
            max={6}
            value={activeRound}
            onChange={(e) => setActiveRound(Number(e.target.value) || 1)}
            className="w-20"
          />
          <Button
            variant="secondary"
            onClick={() => toggleState('activeRound', activeRound)}
            disabled={loading}
          >
            Set active round
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant={matchInPlay ? 'danger' : 'primary'}
            onClick={() => toggleState('matchInPlay', !matchInPlay)}
            disabled={loading}
          >
            {matchInPlay ? 'Stop match' : 'Start match'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => toggleState('transferWindow', !transferWindow)}
            disabled={loading}
          >
            {transferWindow ? 'Close transfers' : 'Open transfers'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => toggleState('allowSubs', !allowSubs)}
            disabled={loading}
          >
            {allowSubs ? 'Disallow subs' : 'Allow subs'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-[#083F5E]">Enter player stats</h2>
        <form onSubmit={submitStats} className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Round"
              type="number"
              min={1}
              max={6}
              value={stats.round}
              onChange={(e) => setStats((s) => ({ ...s, round: Number(e.target.value) || 1 }))}
            />
            <Input
              label="Player ID *"
              placeholder="Required"
              value={stats.playerId}
              onChange={(e) => setStats((s) => ({ ...s, playerId: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <Input label="Goals" type="number" min={0} value={stats.goals} onChange={(e) => setStats((s) => ({ ...s, goals: Number(e.target.value) || 0 }))} />
            <Input label="Assists" type="number" min={0} value={stats.assists} onChange={(e) => setStats((s) => ({ ...s, assists: Number(e.target.value) || 0 }))} />
            <Input label="Clean sheet" type="number" min={0} max={1} value={stats.cleanSheet} onChange={(e) => setStats((s) => ({ ...s, cleanSheet: Number(e.target.value) || 0 }))} />
            <Input label="Yellow card" type="number" min={0} value={stats.yc} onChange={(e) => setStats((s) => ({ ...s, yc: Number(e.target.value) || 0 }))} />
            <Input label="Second yellow" type="number" min={0} value={stats.secondYc} onChange={(e) => setStats((s) => ({ ...s, secondYc: Number(e.target.value) || 0 }))} />
            <Input label="Red card" type="number" min={0} value={stats.rc} onChange={(e) => setStats((s) => ({ ...s, rc: Number(e.target.value) || 0 }))} />
            <Input label="Pen save" type="number" min={0} value={stats.penSave} onChange={(e) => setStats((s) => ({ ...s, penSave: Number(e.target.value) || 0 }))} />
            <Input label="Pen goal" type="number" min={0} value={stats.penGoal} onChange={(e) => setStats((s) => ({ ...s, penGoal: Number(e.target.value) || 0 }))} />
            <Input label="Pen miss" type="number" min={0} value={stats.penMiss} onChange={(e) => setStats((s) => ({ ...s, penMiss: Number(e.target.value) || 0 }))} />
            <Input label="Own goal" type="number" min={0} value={stats.ownGoal} onChange={(e) => setStats((s) => ({ ...s, ownGoal: Number(e.target.value) || 0 }))} />
            <Input label="Conceded" type="number" min={0} value={stats.conceded} onChange={(e) => setStats((s) => ({ ...s, conceded: Number(e.target.value) || 0 }))} />
          </div>
          <Button type="submit" disabled={loading || !stats.playerId}>
            Save stats
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-[#083F5E]">Update leaderboard</h2>
        <Button onClick={updateLeaderboard} disabled={loading}>
          {loading ? 'Updating...' : 'Update leaderboard now'}
        </Button>
      </Card>
    </div>
  );
}
