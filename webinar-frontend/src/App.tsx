import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Create from "./components/Create";
import Dashboard from "./components/Dashboard";
import Meeting from "./components/Meeting";
import Participants from "./components/Participants";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/verify-token" element={<Meeting />} />
        <Route path="/register/:webinarId" element={<Register />} />
        <Route path="/create" element={<Create />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/participants" element={<Participants />} />
      </Routes>
    </Router>
  );
}

export default App;
