import React from "react";
import { IsConnectedProvider } from "../context/IsConnectedContext";
import { PageProvider } from "../context/PageContext";
import { UserProvider } from "../context/UserContext";
import { LoggedInProvider } from "../context/LoggedInContext";
import AppRoutes from "../routes/AppRoutes";

const App = () => {
  return (
    <IsConnectedProvider>
      <LoggedInProvider>
        <UserProvider>
          <PageProvider>
            <AppRoutes />
          </PageProvider>
        </UserProvider>
      </LoggedInProvider>
    </IsConnectedProvider>
  );
};

export default App;
