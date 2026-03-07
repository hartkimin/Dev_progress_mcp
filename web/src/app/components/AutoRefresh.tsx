"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';

export default function AutoRefresh({ interval = 3000, projectId }: { interval?: number, projectId?: string }) {
    const router = useRouter();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Optionally connect to socket.io
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3333';
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            if (projectId) {
                newSocket.emit('joinProject', { projectId });
            }
        });

        const handleUpdate = () => {
            router.refresh();
        };

        newSocket.on('taskUpdated', handleUpdate);
        newSocket.on('taskCreated', handleUpdate);
        newSocket.on('taskDeleted', handleUpdate);

        return () => {
            if (projectId) {
                newSocket.emit('leaveProject', { projectId });
            }
            newSocket.disconnect();
        };
    }, [router, projectId]);

    return null; // This component doesn't render anything visually
}
