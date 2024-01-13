import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import GroupsPage from "../pages/GroupsPage";
import MessagesPage from "../pages/MessagesPage"
import RegisterPage from "../pages/RegisterPage";
import { usePageContext } from "../context/PageContext";

const AppRoutes = () => {
  const { page, setPage } = usePageContext();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route exact path="/register" element={<RegisterPage />} onMatch={() => setPage({ page: "RegisterPage" })} />

      <Route path="/groups" element={<GroupsPage />} onMatch={() => setPage({ page: "GroupsPage" })} />

      <Route path="/groups/:groupId/messages" element={<MessagesPage />} onMatch={() => setPage({ page: "MessagesPage" })} />

      {/*<Route exact path="/profile" element={<ProfilePage />} onMatch={() => setPage({ page: "ProfilePage" })} />*/}

      {/* Handle 404 - Page Not Found */}
    </Routes>
  );
};

export default AppRoutes;
