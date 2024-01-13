import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../src/socket";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (!socket.connected) {
      socket.connect();

      socket.on("connect", () => {
        sendCreateUserEvent();
      });
    } else {
      sendCreateUserEvent();
    }
  };

  const sendCreateUserEvent = () => {
    if (userName && emailId && password) {
      socket.emit("createUser", { userName, emailId, password });
    } else {
      setError("Please provide all the required information.");
    }
  };

  useEffect(() => {
    const handleRegisterUserError = (data) => {
      setError(data.error);
    };

    const handleUserCreated = (data) => {
      console.log("User registered successfully:", data);
      navigate("/");
    };

    socket.on("createUserError", handleRegisterUserError);
    socket.on("userCreated", handleUserCreated);

    return () => {
      socket.off("createUserError", handleRegisterUserError);
      socket.off("userCreated", handleUserCreated);
    };
  }, [navigate]);

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <div style={styles.inputContainer}>
        <label>Username:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
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

export default RegisterPage;
