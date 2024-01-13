import React, { useState } from "react";

const GroupCreationModal = ({ onClose, onCreate, users }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleCreate = () => {
    if (groupName.trim() !== "") {
      onCreate(groupName, selectedUsers, selectedAdmins);
      onClose();
    }
  };

  const handleAdminSelection = (userId) => {
    const updatedAdmins = selectedAdmins.includes(userId)
      ? selectedAdmins.filter((adminId) => adminId !== userId)
      : [...selectedAdmins, userId];

    setSelectedAdmins(updatedAdmins);
  };

  const handleUserClick = (userId) => {
    const updatedSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter((selectedUserId) => selectedUserId !== userId)
      : [...selectedUsers, userId];

    setSelectedUsers(updatedSelectedUsers);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filteredUsers = users?.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filteredUsers);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Create a New Group</h2>
        <label>Group Name:</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div>
          <h3>Search and Select Users:</h3>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {filteredUsers?.map((user) => (
            <div
              key={user.userId}
              style={styles.userItem}
              onClick={() => handleUserClick(user.userId)}
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.userId)}
                readOnly
              />
              <span>{user.userName}</span>
            </div>
          ))}
        </div>
        <div>
          <h3>Select Group Admins:</h3>
          {selectedUsers?.map((userId) => (
            <div key={userId} style={styles.userItem}>
              <input
                type="checkbox"
                checked={selectedAdmins.includes(userId)}
                onChange={() => handleAdminSelection(userId)}
              />
              <span>{users?.find((user) => user.userId === userId)?.userName}</span>
            </div>
          ))}
        </div>
        <div style={styles.modalButtons}>
          <button onClick={handleCreate}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "black",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
  },
  modalButtons: {
    marginTop: "15px",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    cursor: "pointer",
  },
};

export default GroupCreationModal;
