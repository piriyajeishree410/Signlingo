import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Flashscreen from "./pages/Flashscreen";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Flashscreen />} />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;