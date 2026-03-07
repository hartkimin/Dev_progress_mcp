'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { setAccessToken } from '@/lib/db';
import { io, Socket } from 'socket.io-client';

export default function SyncAuth() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (session && (session as any).accessToken) {
      setAccessToken((session as any).accessToken);

      // Join personal notification room
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3333';
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        if ((session as any).dbUser?.id) {
          newSocket.emit('joinUserNotifications', { userId: (session as any).dbUser.id });
        }
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setAccessToken(null);
    }
  }, [session]);

  return null;
}
