import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import MobileApp from "./MobileApp.jsx";
import { ErrorBoundary } from "react-error-boundary";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { BrowserRouter } from "react-router-dom";

let view;

function checkDevice() {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    view = <MobileApp />;
  } else {
    view = <App />;
  }
}

checkDevice();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorMessage}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
