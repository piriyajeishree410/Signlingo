import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { HelpProvider } from "./context/HelpContext.jsx"; 
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
