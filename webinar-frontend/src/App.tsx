import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Create from "./components/Create";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register/:webinarId" element={<Register />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </Router>
  );
}

export default App;
