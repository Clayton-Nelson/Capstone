import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../src/socket";

const IsConnectedContext = createContext();

export const IsConnectedProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <IsConnectedContext.Provider value={{ isConnected }}>
      {children}
    </IsConnectedContext.Provider>
  );
};

export const useIsConnected = () => {
  return useContext(IsConnectedContext);
};
