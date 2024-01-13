import React, { useState } from "react";
import { socket } from "../src/socket";

const Login = () => {
  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    const loginData = {
      emailId,
      password,
    };

    socket.emit("getUser", loginData);
  };

  return (
    <div>
      <h2>Login</h2>
      <label>Email:</label>
      <input
        type="text"
        value={emailId}
        onChange={handleEmailChange}
        placeholder="Enter your email"
      />
      <br />
      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter your password"
      />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
