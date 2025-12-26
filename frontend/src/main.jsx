import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import { HelpProvider } from "./context/helpContext.jsx"; 
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HelpProvider>   
          <App />
        </HelpProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
