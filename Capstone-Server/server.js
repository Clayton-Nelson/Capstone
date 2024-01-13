const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

// Create an HTTP server using Express
const server = http.createServer(app);

// Create a new Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://admin.socket.io"],
    credentials: true,
  },
});

// Enable Socket.IO admin UI for development
instrument(io, {
  auth: false,
  mode: "development",
});

// Object to store user sockets
const userSockets = {};

app.use(express.json());

// Connect to the database
let dbConnect = require("./dbConnect");

// Import and use group routes
let groupRoutes = require("./routes/groupRoutes");
app.use("/api/groups", groupRoutes);

// Import and use user routes
let userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const port = process.env.PORT || 8080;

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`New Socket connected, Socket ID: ${socket.id}`);

  let localUserId = "";

  // User Events

  // Event to authenticate and get user data
  socket.on("getUser", (data) => {
    const { emailId, password } = data;

    axios
      .get(`http://localhost:8080/api/users/${emailId}/${password}`)
      .then((response) => {
        const user = response.data.data;

        if (user && user._id) {
          localUserId = user._id;

          userSockets[user._id] = socket;

          console.log(`New connection established in userSockets`);
          console.log(`Socket ID: ${socket.id}`);
          console.log(`User ID: ${user._id}`);
          console.log(`Connected at: ${new Date().toISOString()}`);

          socket.emit("userAttached", {
            message: "Socket attached to user namespace",
            user,
          });
        } else {
          socket.emit("getUserError", { error: "Invalid user data" });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          socket.emit("getUserError", { error: "Email not found" });
        } else if (error.response && error.response.status === 401) {
          socket.emit("getUserError", { error: "Incorrect password" });
        } else {
          console.error(error);
          socket.emit("getUserError", { error: error.message });
        }
      });
  });

  // Event to get user data by IDs
  socket.on("getUsersByIds", (data) => {
    const { userIds } = data;

    Promise.all(
      userIds.map((userId) =>
        axios.get(`http://localhost:8080/api/users/${userId}`)
      )
    )
      .then((responses) => {
        const userDataArray = responses.map((response) => response.data.data);

        socket.emit("usersByIds", userDataArray);
      })
      .catch((error) => {
        console.error(error);
        socket.emit("usersByIdsError", { error: error.message });
      });
  });

  // Event to create a new user
  socket.on("createUser", (data) => {
    const { userName, emailId, password } = data;

    axios
      .post("http://localhost:8080/api/users/create", {
        userName,
        emailId,
        password,
      })
      .then((response) => {
        const user = response.data.data;

        localUserId = user._id;
        userSockets[user._id] = socket;

        console.log(`New connection established in userSockets`);
        console.log(`Socket ID: ${socket.id}`);
        console.log(`User ID: ${user._id}`);
        console.log(`Connected at: ${new Date().toISOString()}`);

        socket.emit("userCreated", { user });
      })
      .catch((error) => {
        console.error(error);
        socket.emit("createUserError", { error: error.message });
      });
  });

  // Group Events

  // Event to get group messages and join the room
  socket.on("getGroupMessages", (data) => {
    const { groupId } = data;
    const room = io.of("/").adapter.rooms.get(groupId);

    if (!room) {
      console.log(`Room ${groupId} does not exist. Creating room...`);

      socket.join(groupId);
      console.log(`Socket ${socket.id} joined room: ${groupId}`);

      axios
        .get(
          `http://localhost:8080/api/groups/messages/${groupId}/${localUserId}`
        )
        .then((response) => {
          const groupData = response.data.data;
          socket.emit("groupMessages", groupData);
          io.to(groupId).emit("joinedRoom", { roomId: groupId });
        })
        .catch((error) => {
          console.error(error);
          socket.emit("groupMessagesError", { error: error.message });
        });
    } else {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined room: ${groupId}`);

      axios
        .get(
          `http://localhost:8080/api/groups/messages/${groupId}/${localUserId}`
        )
        .then((response) => {
          const groupData = response.data.data;
          socket.emit("groupMessages", groupData);
          io.to(groupId).emit("joinedRoom", { roomId: groupId });
        })
        .catch((error) => {
          console.error(error);
          socket.emit("groupMessagesError", { error: error.message });
        });
    }
  });

  // Event to update user groups
  socket.on("updateGroups", () => {
    axios
      .get(`http://localhost:8080/api/groups/all/${localUserId}`)
      .then((response) => {
        const allGroups = response.data.data;

        axios
          .patch(`http://localhost:8080/api/users/groups/${localUserId}`, {
            groups: allGroups.map((group) => group._id),
          })
          .then(() => {
            socket.emit("groupsUpdatedConfirmation");
            console.log(`User groups updated for user ID: ${localUserId}`);
          })
          .catch((error) => {
            console.error(error);
            socket.emit("updateGroupsError", { error: error.message });
          });
      })
      .catch((error) => {
        console.error(error);
        socket.emit("updateGroupsError", { error: error.message });
      });
  });

  // Event to create a new group
  socket.on("createGroup", (groupData) => {
    const modifiedGroupData = {
      ...groupData,
      users: [...groupData.users, localUserId],
      admins: [...groupData.admins, localUserId],
    };

    axios
      .post("http://localhost:8080/api/groups/create", modifiedGroupData)
      .then((response) => {
        socket.emit("groupCreated", response.data);
      })
      .catch((error) => {
        console.error(error);
        socket.emit("createGroupError", { error: error.message });
      });
  });

  // Event to get brief information about the users groups
  socket.on("getBriefGroups", () => {
    axios
      .get(`http://localhost:8080/api/groups/brief/${localUserId}`)
      .then((response) => {
        const briefGroups = response.data.data;
        socket.emit("briefGroups", briefGroups);
      })
      .catch((error) => {
        console.error(error);
        socket.emit("getBriefGroupsError", { error: error.message });
      });
  });

  // Message Events

  // Event to create a new message in a group
  socket.on("createMessage", (data) => {
    const { groupId } = data;
    axios
      .post(
        `http://localhost:8080/api/groups/messages/create/${groupId}/${localUserId}`,
        data
      )
      .then((response) => {
        console.log("Server: Sending messageCreated event to room:", groupId);
        io.sockets.in(groupId).emit("messageCreated", response.data.data);
      })
      .catch((error) => {
        console.error("Server: Error creating message:", error);
        socket.emit("createMessageError", { error: error.message });
      });
  });

  // Event to delete a message in a group
  socket.on("deleteMessage", (data) => {
    const { groupId, messageId } = data;
    axios
      .delete(
        `http://localhost:8080/api/groups/messages/delete/${groupId}/${localUserId}/${messageId}`
      )
      .then((response) => {
        socket.emit("messageDeleted", response.data);
      })
      .catch((error) => {
        console.error(error);
        socket.emit("deleteMessageError", { error: error.message });
      });
  });

  // Disconnecting Events

  // Event to handle leaving room
  socket.on("leaveRoom", (data) => {
    const { roomId } = data;

    if (roomId) {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
    }
  });

  // Event to handle socket disconnection
  socket.on("disconnect", () => {
    if (localUserId) {
      console.log(
        `Socket ID: ${socket.id}, User ID: ${localUserId} disconnected`
      );
      delete userSockets[localUserId];
      localUserId = "";
    } else {
      console.log(`Disconnected socket not associated with any user`);
    }
  });
});

// Start the server and log the listening status, including the server URL and port
server.listen(port, () => {
  console.log(`Capstone Server is listening 
  at http://localhost:${port}`);
});
