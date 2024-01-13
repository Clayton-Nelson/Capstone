import React, { useState, useContext } from "react";

const PageContext = React.createContext();

export const PageProvider = (props) => {
  const [page, setPage] = useState({page: "LandingPage"});

  return (
    <PageContext.Provider value={{page, setPage}}>
      {props.children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  return useContext(PageContext);
};

