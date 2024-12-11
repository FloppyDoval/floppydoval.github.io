import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LearnPage from "../components/pages/LearnPage";
import HomePage from "../components/pages/Homepage";
import PracticePage from "../components/pages/PracticePage";
import LeaderBoard from "../components/pages/LeaderBoard";
import ResumePage from "../components/pages/ResumePage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home page route */}
        <Route path="/" element={<HomePage />} />
        {/* LearnPage route */}
        <Route path="/learnPage" element={<LearnPage />} />
        {/* LeaderBoard route */}
        <Route path="/leaderBoard" element={<LeaderBoard />} />
        {/* ResumePage route */}
        <Route path="/resume" element={<ResumePage />} />
        {/* PracticePage route */}
        <Route path="/practicePage/:level" Component={PracticePage} />
      </Routes>
    </Router>
  );
};

export default App;
