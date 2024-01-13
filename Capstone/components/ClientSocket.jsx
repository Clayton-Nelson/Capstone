import React, { useEffect } from "react";
import socket from "../src/socket";

function ClientSocket() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server.");

      socket.emit("getGroupMessages", {
        groupId: "yourGroupId",
        requesterId: "yourRequesterId",
      });

      socket.emit("createMessage", {
        groupId: "yourGroupId",
        requesterId: "yourRequesterId",
        message: {
          senderId: "yourSenderId",
          text: "Your message text here",
        },
      });

      socket.emit("deleteMessage", {
        messageId: "yourMessageId",
        requesterId: "yourRequesterId",
      });

      socket.on("groupMessages", (messages) => {
        console.log("Group messages:", messages);
      });

    });

    return () => {
      socket.off("groupMessages");
    };
  }, []);
}

export default ClientSocket;
