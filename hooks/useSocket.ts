import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client"

// let socket: Socket;

export function useSocket(){
    const [socket, setSocket] = useState<Socket | null>(null);
    useEffect(() => {
        const socketIO = io("http://localhost:4000");
        setSocket(socketIO);

        return () => {
            socketIO.disconnect();
        };
    },[]);
    return socket;
}
