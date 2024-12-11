import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResumePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const timeSpent = location.state?.timeSpent || 0;
  const previousTimeSpent = location.state?.previousTimeSpent || 0;
  const totalTimeSpent = timeSpent + previousTimeSpent;

  const handleResume = () => {
    navigate("/learnPage", {
      state: {
        timeSpent,
        previousTimeSpent,
        currentIndex: location.state?.currentIndex || 0,
        progress: location.state?.progress || 0,
        correctAttempts: location.state?.correctAttempts || 0,
        incorrectAttempts: location.state?.incorrectAttempts || 0
      }
    });
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh" 
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>Resume</h1>
      <p style={{ fontSize: "2rem" }}>
        Timer: {Math.floor(totalTimeSpent / 60)}:{("0" + (totalTimeSpent % 60)).slice(-2)}
      </p>
      <button 
        onClick={handleResume} 
        style={{ 
          padding: "10px 20px", 
          fontSize: "1.5rem", 
          marginTop: "2rem" 
        }}
      >
        Resume Lesson
      </button>
    </div>
  );
};

export default ResumePage;