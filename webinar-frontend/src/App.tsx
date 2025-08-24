import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register/:webinarId" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
