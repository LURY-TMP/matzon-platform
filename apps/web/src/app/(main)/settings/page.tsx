'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usersApi } from '@/lib/api';
import { Card, Button, Input, Badge } from '@/components/ui';
import { User, Shield, Bell, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await usersApi.update({ username: username || undefined, bio: bio || undefined });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-white/50 text-sm mt-1">Manage your account</p>
      </div>

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-6"><User className="w-5 h-5 text-accent" /><h2 className="font-semibold">Profile</h2></div>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-2xl font-bold text-accent">{user?.username?.charAt(0).toUpperCase()}</div>
          <div>
            <p className="font-semibold">{user?.username}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="accent">{user?.role}</Badge>
              <Badge variant="success">Level {user?.level}</Badge>
              <Badge>{user?.xp} XP</Badge>
            </div>
          </div>
        </div>
        {success && <div className="bg-success/10 border border-success/20 rounded-md px-4 py-3 text-sm text-success mb-4">Profile updated</div>}
        {error && <div className="bg-danger/10 border border-danger/20 rounded-md px-4 py-3 text-sm text-danger mb-4">{error}</div>}
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-white/70">Bio</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="About you..." rows={3} disabled={isLoading}
              className="w-full bg-bg-card border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none" />
          </div>
          <Button type="submit" isLoading={isLoading}>Save Changes</Button>
        </form>
      </Card>

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-4"><Shield className="w-5 h-5 text-accent" /><h2 className="font-semibold">Security</h2></div>
        <p className="text-sm text-white/40 mb-4">Password and 2FA coming soon.</p>
        <Button variant="secondary" size="sm" disabled>Change Password</Button>
      </Card>

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-4"><Bell className="w-5 h-5 text-accent" /><h2 className="font-semibold">Notifications</h2></div>
        <p className="text-sm text-white/40 mb-4">Notification preferences coming soon.</p>
        <Button variant="secondary" size="sm" disabled>Configure</Button>
      </Card>

      <Card hover={false} className="border-danger/20">
        <div className="flex items-center justify-between">
          <div><h2 className="font-semibold text-danger">Sign Out</h2><p className="text-sm text-white/40 mt-1">Sign out of your account</p></div>
          <Button variant="danger" size="sm" onClick={logout}><LogOut className="w-4 h-4" /> Log Out</Button>
        </div>
      </Card>
    </div>
  );
}
