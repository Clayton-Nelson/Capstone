import React, { createContext, useContext, useState } from "react";

const LoggedInContext = createContext();

export const LoggedInProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const setLoggedIn = () => {
    setIsLoggedIn(true);
  };

  const value = {
    isLoggedIn,
    setLoggedIn,
  };

  return (
    <LoggedInContext.Provider value={value}>{children}</LoggedInContext.Provider>
  );
};

export const useLoggedInContext = () => {
  const context = useContext(LoggedInContext);

  if (!context) {
    throw new Error(
      "useLoggedInContext must be used within a LoggedInProvider"
    );
  }

  return context;
};
