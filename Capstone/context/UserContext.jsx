import React, { useState, useContext } from "react";

const UserContext = React.createContext();

export const UserProvider = (props) => {
  const [user, setUser] = useState({
    userId: '',
    userName: '',
    friends: '',
    groups: '',
    pendingRequests: ''
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
