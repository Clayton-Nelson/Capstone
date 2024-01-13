import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { useLoggedInContext } from "../context/LoggedInContext";
import { socket } from "../src/socket";

const LandingPage = () => {
  const { user, setUser } = useUserContext();
  const { isLoggedIn, setLoggedIn } = useLoggedInContext();
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const connectToSocket = (emailId, password) => {
    if (!socket.connected) {
      socket.connect();

      socket.on("connect", () => {
        socket.emit("getUser", { emailId, password });
      });
    } else {
      socket.emit("getUser", { emailId, password });
    }
  };

  const handleLogin = () => {
    if (emailId && password) {
      connectToSocket(emailId, password);
    } else {
      setError("Please provide both email and password.");
    }
  };
  

  const handleRegister = () => {
    navigate("/register");
  };

  useEffect(() => {
    socket.on("getUserError", (data) => {
      setError(data.error);
    });

    socket.on("userAttached", (data) => {
        const userInfo = data.user;
      
        setUser((prevUser) => ({
          ...prevUser,
          userId: userInfo._id,
          userName: userInfo.userName,
          friends: userInfo.friends,
          groups: userInfo.groups,
          pendingRequests: userInfo.pendingRequests,
        }));
  
        socket.emit("updateGroups");

        socket.once("groupsUpdatedConfirmation", () => {
          setLoggedIn();
        });
      });
      

    return () => {
      socket.off("getUserError");
      socket.off("userAttached");
    };
  }, [navigate, setUser, setLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      console.log("User has been updated:", user);
      navigate("/groups");
    }
  }, [isLoggedIn, navigate, user]);

  return (
    <div style={styles.container}>
      <h2>Login or Register</h2>
      <div style={styles.inputContainer}>
        <label>Email:</label>
        <input
          type="text"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
        />
      </div>
      <div style={styles.inputContainer}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.buttonContainer}>
        <button onClick={handleLogin}>Log in</button>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "300px",
    margin: "auto",
    marginTop: "100px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  inputContainer: {
    margin: "10px 0",
  },
  buttonContainer: {
    marginTop: "20px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "5px",
  },
};

export default LandingPage;
