import { io as mainSocket } from "socket.io-client";

export const socket = mainSocket("http://localhost:8080", {
  autoConnect: false,
});