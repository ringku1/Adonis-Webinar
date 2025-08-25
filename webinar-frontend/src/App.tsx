import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Create from "./components/Create";
import Dashboard from "./components/Dashboard";
import Meeting from "./components/Meeting";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify-token" element={<Meeting />} />
        <Route path="/register/:webinarId" element={<Register />} />
        <Route path="/create" element={<Create />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
