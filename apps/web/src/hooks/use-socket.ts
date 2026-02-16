'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { socketClient } from '@/lib/socket';

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      socketClient.disconnect();
      setIsConnected(false);
      return;
    }

    socketClient.connect();

    const onConnected = (data: any) => {
      setIsConnected(true);
      setOnlineCount(data.onlineCount || 0);
    };

    const onOnline = (data: any) => setOnlineCount(data.onlineCount || 0);
    const onOffline = (data: any) => setOnlineCount(data.onlineCount || 0);
    const onDisconnect = () => setIsConnected(false);

    socketClient.on('connected', onConnected);
    socketClient.on('user:online', onOnline);
    socketClient.on('user:offline', onOffline);
    socketClient.on('disconnect', onDisconnect);

    return () => {
      socketClient.off('connected', onConnected);
      socketClient.off('user:online', onOnline);
      socketClient.off('user:offline', onOffline);
      socketClient.off('disconnect', onDisconnect);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback((event: string, callback: Function) => {
    socketClient.on(event, callback);
    return () => socketClient.off(event, callback);
  }, []);

  return { isConnected, onlineCount, subscribe, socketClient };
}
