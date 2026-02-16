'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { notificationsApi } from '@/lib/api';
import { useSocket } from './use-socket';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const { subscribe } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const result = await notificationsApi.unreadCount();
      setUnreadCount(result.count);
    } catch {
      // Silent fail
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (cursor?: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const result = await notificationsApi.list(cursor);
      if (cursor) {
        setNotifications((prev) => [...prev, ...result.data]);
      } else {
        setNotifications(result.data);
      }
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  }, []);

  const loadMore = useCallback(() => {
    if (nextCursor && !isLoading) {
      fetchNotifications(nextCursor);
    }
  }, [nextCursor, isLoading, fetchNotifications]);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, [fetchUnreadCount, fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsub = subscribe('notification', (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return unsub;
  }, [isAuthenticated, subscribe]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh: () => { fetchUnreadCount(); fetchNotifications(); },
  };
}
