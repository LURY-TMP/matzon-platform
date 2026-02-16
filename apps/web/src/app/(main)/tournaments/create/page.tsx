'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { tournamentsApi } from '@/lib/api';
import { Card, Button, Input } from '@/components/ui';
import { Trophy } from 'lucide-react';

const FORMATS = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'SWISS', label: 'Swiss' },
];

export default function CreateTournamentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('SINGLE_ELIMINATION');
  const [maxPlayers, setMaxPlayers] = useState('16');
  const [prizePool, setPrizePool] = useState('');
  const [rules, setRules] = useState('');
  const [startDate, setStartDate] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tournament = await tournamentsApi.create({
        name,
        game,
        description: description || undefined,
        format,
        maxPlayers: parseInt(maxPlayers, 10),
        prizePool: prizePool || undefined,
        rules: rules || undefined,
        startDate,
      }) as any;

      router.push(`/tournaments`);
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Create Tournament</h1>
        <p className="text-white/50 text-sm mt-1">Set up a new competitive event</p>
      </div>

      <Card hover={false}>
        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-md px-4 py-3 text-sm text-danger mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            label="Tournament Name"
            placeholder="e.g. MATZON Invitational #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <Input
            id="game"
            label="Game"
            placeholder="e.g. Valorant, CS2, League of Legends"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            disabled={isLoading}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-white/70">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your tournament..."
              rows={3}
              disabled={isLoading}
              className="w-full bg-bg-card border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="format" className="text-sm font-medium text-white/70">Format</label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={isLoading}
                className="w-full bg-bg-card border border-border rounded-md px-4 py-3 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 appearance-none"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <Input
              id="maxPlayers"
              label="Max Players"
              type="number"
              min="2"
              max="256"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              label="Start Date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />

            <Input
              id="prizePool"
              label="Prize Pool (optional)"
              placeholder="e.g. $500"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="rules" className="text-sm font-medium text-white/70">Rules (optional)</label>
            <textarea
              id="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Tournament rules and guidelines..."
              rows={4}
              disabled={isLoading}
              className="w-full bg-bg-card border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" size="lg" className="flex-1" isLoading={isLoading}>
              <Trophy className="w-4 h-4" /> Create Tournament
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
