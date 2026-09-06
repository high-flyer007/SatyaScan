import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InspectionProvider } from "./context/InspectionContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InspectionProvider>
      <App />
    </InspectionProvider>
  </React.StrictMode>
);