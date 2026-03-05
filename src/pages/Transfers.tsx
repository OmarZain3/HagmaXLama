import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRound } from '@/context/RoundContext';
import { api } from '@/api/api';
import type { Player } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import PlayerCard2 from '@/components/PlayerCard2';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function Transfers() {
  const { user } = useAuth();
  const { state: roundState } = useRound();
  const [myPlayers, setMyPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState('');
  const [loading, setLoading] = useState(true);
  const [outId, setOutId] = useState<string | null>(null);
  const [inId, setInId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const transferAllowed = roundState?.TransferWindow && !roundState?.MatchInPlay;
  const myPlayerIds = myPlayers.map((p) => p.ID);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        api.viewMyPlayers({ userId: user.userId }),
        api.viewAllPlayers({}),
      ]);
      if (myRes.success && myRes.data) {
        setMyPlayers((myRes.data.players as Player[]) ?? []);
        setCaptainId(myRes.data.captainId ?? '');
      }
      if (allRes.success && allRes.data?.players) {
        setAllPlayers((allRes.data.players as Player[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const doTransfer = async () => {
    if (!user?.userId || !outId || !inId) return;
    if (outId === captainId) {
      setMessage('Cannot transfer captain');
      return;
    }
    setMessage('');
    try {
      const res = await api.transferPlayer({
        userId: user.userId,
        outPlayerId: outId,
        inPlayerId: inId,
      });
      if (res.success) {
        setMessage('Transfer complete');
        setOutId(null);
        setInId(null);
        load();
      } else {
        setMessage(res.error ?? 'Transfer failed');
      }
    } catch {
      setMessage('Request error');
    }
  };

  const availableToBuy = allPlayers.filter((p) => !myPlayerIds.includes(p.ID));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#EECC4E]">Transfers</h1>
      {!transferAllowed && (
        <Card className="border-2 border-[#A71F26]">
          <p className="text-[#083F5E]">
            Transfer window is closed or match is in play. Transfers allowed only between Quarter and Semi Finals (max 2).
          </p>
        </Card>
      )}
      {message && (
        <p className={`text-sm ${message === 'Transfer complete' ? 'text-[#EECC4E]' : 'text-[#A71F26]'}`}>
          {message}
        </p>
      )}
      {loading ? (
        <LoadingSpinner message="Loading..." />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#F8ECA7]">Select player to remove</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {myPlayers.map((p) => (
                <PlayerCard2
                  key={p.ID}
                  player={p}
                  isCaptain={p.ID === captainId}
                  selected={outId === p.ID}
                  onSelect={
                    transferAllowed && p.ID !== captainId
                      ? () => setOutId(outId === p.ID ? null : p.ID)
                      : undefined
                  }
                  disabled={!transferAllowed || p.ID === captainId}
                  actionLabel={outId === p.ID ? 'Cancel' : 'Out'}
                />
              ))}
            </div>
          </section>
          {outId && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#F8ECA7]">Select player to add</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableToBuy.map((p) => (
                  <PlayerCard2
                    key={p.ID}
                    player={p}
                    selected={inId === p.ID}
                    onSelect={() => setInId(inId === p.ID ? null : p.ID)}
                    actionLabel={inId === p.ID ? 'Cancel' : 'In'}
                  />
                ))}
              </div>
              {inId && (
                <Button
                  className="mt-3"
                  onClick={doTransfer}
                  disabled={!transferAllowed}
                >
                  Confirm transfer
                </Button>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
