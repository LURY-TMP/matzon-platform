'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { feedApi } from '@/lib/api';
import { useSocket } from './use-socket';

export function useFeed(mode: 'personal' | 'global' = 'personal') {
  const { isAuthenticated } = useAuth();
  const { subscribe } = useSocket();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (cursor?: string) => {
    if (mode === 'personal' && !isAuthenticated) return;
    if (!cursor) setIsLoading(true);
    setError(null);

    try {
      const fetchFn = mode === 'personal' ? feedApi.personal : feedApi.global;
      const result = await fetchFn(cursor);

      if (cursor) {
        setEvents((prev) => [...prev, ...result.data]);
      } else {
        setEvents(result.data);
      }
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, [mode, isAuthenticated]);

  const loadMore = useCallback(() => {
    if (nextCursor && !isLoading) {
      fetchFeed(nextCursor);
    }
  }, [nextCursor, isLoading, fetchFeed]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (!isAuthenticated || mode !== 'personal') return;

    const unsub = subscribe('feed:new_event', (data: any) => {
      setEvents((prev) => [data, ...prev]);
    });

    return unsub;
  }, [isAuthenticated, mode, subscribe]);

  return { events, isLoading, hasMore, error, loadMore, refresh: () => fetchFeed() };
}
