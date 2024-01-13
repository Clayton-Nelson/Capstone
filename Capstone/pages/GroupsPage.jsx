import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { socket } from "../src/socket";
import GroupCreationModal from "../modals/GroupCreationModal";
import Box from "@mui/material/Box";

const GroupsPage = () => {
  const { user } = useUserContext();
  const [briefGroups, setBriefGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const initialFetchDoneRef = useRef(false);

  const handleGetBriefGroups = () => {
    socket.emit("getBriefGroups");
  };

  const handleInitialFetch = () => {
    if (!initialFetchDoneRef.current) {
      handleGetBriefGroups();
      initialFetchDoneRef.current = true;
    }
  };

  const handleConnect = (group) => {
    navigate(`/groups/${group._id}/messages`);
  };

  useEffect(() => {
    handleInitialFetch();

    const handleBriefGroups = (data) => {
      const userIDs = data.flatMap((group) => group.users);
      socket.emit("getUsersByIds", { userIds: userIDs });

      const handleUsersByIds = (userDataArrays) => {
        const userDataArray = userDataArrays.flat();

        const updatedData = data.map((group) => {
          const updatedGroup = {
            ...group,
            usersWithUsernames: group.users.map((userID) => {
              const foundUser = userDataArray.find(
                (userData) => userData && userData._id === userID
              );

              return {
                userID,
                userName: foundUser?.userName || `User-${userID}`,
              };
            }),
          };

          return updatedGroup;
        });

        setBriefGroups(updatedData);
      };

      socket.on("usersByIds", handleUsersByIds);

      return () => {
        socket.off("usersByIds", handleUsersByIds);
      };
    };

    socket.on("briefGroups", handleBriefGroups);

    return () => {
      socket.off("briefGroups", handleBriefGroups);
    };
  }, [socket]);

  const handleCreateGroup = (groupName, selectedUsers, selectedAdmins) => {
    socket.emit("createGroup", {
      groupName,
      users: selectedUsers,
      admins: selectedAdmins,
    });
  };

  useEffect(() => {
    const handleGroupCreated = (data) => {
      console.log("Group created successfully. Fetching brief groups...", data);
      handleGetBriefGroups();
    };

    socket.on("groupCreated", handleGroupCreated);

    return () => {
      socket.off("groupCreated", handleGroupCreated);
    };
  }, []);

  return (
    <Box sx={styles.container}>
      <h2>Your Groups</h2>

      {briefGroups.length > 0 ? (
        <Box sx={styles.groupContainer}>
          {briefGroups.map((group) => (
            <Box key={group._id} sx={styles.groupBox}>
              <Box
                sx={{
                  ...styles.titleRow,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <h3>{group.groupName}</h3>
                <button
                  onClick={() => handleConnect(group)}
                  style={styles.connectButton}
                >
                  Connect
                </button>
              </Box>
              <Box sx={styles.messagesRow}>
                <div style={styles.messageBubblesContainer}>
                  {group.messages?.map((message, index) => {
                    const senderUser = group.usersWithUsernames.find(
                      (user) => user.userID === message.senderId
                    );

                    const isCurrentUser = senderUser?.userID === user.userId;

                    return (
                      <div
                        key={index}
                        style={{
                          ...styles.messageContainer,
                          ...(isCurrentUser
                            ? styles.messageLeft
                            : styles.messageRight),
                        }}
                      >
                        <div style={styles.messageBubble}>
                          <p>{message.text}</p>
                        </div>
                        <div style={styles.messageSender}>
                          <p>
                            {isCurrentUser
                              ? ": You"
                              : `${senderUser?.userName} :`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Box>
              <Box sx={styles.usersRow}>
                <p>
                  Users:{" "}
                  {group.usersWithUsernames
                    .map((user) => user.userName)
                    .join(", ")}
                </p>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <p>You are not a member of any groups.</p>
      )}

      <button onClick={() => setShowModal(true)}>Create Group</button>

      {showModal && (
        <GroupCreationModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </Box>
  );
};

const styles = {
  container: {
    width: "80%",
    margin: "auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  groupContainer: {
    display: "flex",
    overflowY: "auto",
    justifyContent: "space-around",
    flexWrap: "wrap",
    maxHeight: "650px",
  },
  groupBox: {
    width: "400px",
    margin: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    height: "300px",
    paddingLeft: "15px",
    paddingRight: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
  titleRow: {
    marginBottom: "10px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  messagesRow: {
    flex: 3,
    overflowY: "auto",
    marginBottom: "10px",
  },
  usersRow: {
    borderTop: "1px solid #ddd",
    flex: 1,
  },
  messageBubblesContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "8px",
    gap: "8px",
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
  connectButton: {
    backgroundColor: "green",
    color: "white",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    border: "none",
    marginLeft: "10px",
  },
};

export default GroupsPage;
