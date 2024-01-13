import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { socket } from "../src/socket";
import { useUserContext } from "../context/UserContext";

const MessagesPage = () => {
  const { user } = useUserContext();
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { groupId } = useParams();
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const handleGroupMessages = (messages) => {
      console.log("Client: Received groupMessages event:", messages);

      const userIds = Array.from(
        new Set(messages.map((message) => message.senderId))
      );
      socket.emit("getUsersByIds", { userIds });

      const handleUsersByIds = (userDataArray) => {
        const flattenedUserData = userDataArray.flat();

        const updatedMessages = messages.map((message) => {
          const senderUser = flattenedUserData.find(
            (userData) => userData && userData._id === message.senderId
          );

          return {
            ...message,
            senderName: senderUser?.userName || `User-${message.senderId}`,
          };
        });

        setGroupMessages((prevMessages) => [
          ...prevMessages,
          ...updatedMessages,
        ]);
      };

      socket.once("usersByIds", handleUsersByIds);

      return () => {
        console.log("Client: Cleaning up usersByIds event listener");
        socket.off("usersByIds", handleUsersByIds);
      };
    };

    const handleNewMessage = (newMessage) => {
      console.log("Client: Received messageCreated event:", newMessage);

      setGroupMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const handleJoinedRoom = ({ roomId }) => {
      console.log(`Client: Socket joined room: ${roomId}`);
    };

    const handleLeftRoom = ({ roomId }) => {
      console.log(`Client: Socket left room: ${roomId}`);
    };

    socket.emit("getGroupMessages", { groupId });
    socket.once("groupMessages", handleGroupMessages);
    socket.on("messageCreated", handleNewMessage);
    socket.on("joinedRoom", handleJoinedRoom);
    socket.on("leftRoom", handleLeftRoom);

    return () => {
      console.log(
        "Client: Cleaning up groupMessages, messageCreated, joinedRoom, and leftRoom event listeners"
      );
      socket.off("groupMessages", handleGroupMessages);
      socket.off("messageCreated", handleNewMessage);
      socket.off("joinedRoom", handleJoinedRoom);
      socket.off("leftRoom", handleLeftRoom);
      socket.emit("leaveRoom", { roomId: groupId });
    };
  }, [groupId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [groupMessages]);

  const handleSendMessage = () => {
    const messageData = { senderId: user.userId, text: newMessage };
    console.log("Client: Sending createMessage event with data:", messageData);
    socket.emit("createMessage", { groupId, message: messageData });
    setNewMessage("");
  };

  return (
    <Box sx={styles.container}>
      <h2>Group Messages</h2>

      <div style={styles.messageBubblesContainer} ref={messagesContainerRef}>
        {groupMessages.map((message, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                message.senderId === user.userId ? "flex-end" : "flex-start",
              ...(message.senderId === user.userId
                ? styles.messageLeft
                : styles.messageRight),
            }}
          >
            <div style={styles.messageBubble}>
              <p>{message.text}</p>
            </div>
            <div style={styles.messageSender}>
              <p>
                {message.senderId === user.userId
                  ? ": You"
                  : `${message.senderName || "Unknown User"} :`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </Box>
  );
};

const styles = {
  container: {
    width: "600px",
    margin: "auto",
    marginTop: "50px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  messageBubblesContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "8px",
    gap: "8px",
    height: "600px",
    overflowY: "auto",
  },
  messageContainer: {
    display: "flex",
    alignItems: "center",
  },
  messageBubble: {
    border: "1px solid #ccc",
    borderRadius: "15px",
    wordBreak: "break-word",
    marginLeft: "8px",
    marginRight: "8px",
    padding: "0px 10px",
  },
  messageSender: {
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  messageLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  messageRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default MessagesPage;
