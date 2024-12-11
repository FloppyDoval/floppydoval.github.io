import React, { useState, useEffect, useRef } from "react";
import { charactersToLearn } from "../../data/characters";
import KoreanKeyboard from "../keyboard";
import ProgressBar from "../ProgressBar";
import Card from "../Card";
import styles from "../../styles/LearnPage.module.scss";
import ResultsPage from "./ResultsPage";

import {
  SignedIn,
  SignOutButton,
  useUser,
} from "@clerk/clerk-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export const LearnPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledCharacters, setShuffledCharacters] = useState(
    [...charactersToLearn].sort(() => Math.random() - 0.5)
  );
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const currentCharacter = shuffledCharacters[currentIndex];

  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  let user = useUser().user;

  const handleKeyPress = (key: string) => {
    if (isLessonComplete || isPaused) return;
    const expectedKey = currentCharacter.roman_representation;
    const requiresShift = expectedKey === expectedKey.toUpperCase();

    if (
      (requiresShift && isShiftPressed && key === expectedKey) || 
      (!requiresShift && key === expectedKey.toLowerCase())
    ) {
      setIsCorrect(true);
      setCorrectAttempts(correctAttempts + 1);
      setTimeout(() => {
        if (currentIndex < shuffledCharacters.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setProgress(((currentIndex + 1) / shuffledCharacters.length) * 100);
        } else {
          setIsLessonComplete(true);
        }
        setIsCorrect(null);
      }, 500);
    } else if (key !== "Shift") {
      setIsCorrect(false);
      setIncorrectAttempts(incorrectAttempts + 1);
      setTimeout(() => setIsCorrect(null), 500);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const resumedTime = location.state?.timeSpent || 0;
    startTimeRef.current = Date.now() - (resumedTime * 1000);

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
        setTimeSpent(elapsedSeconds);
        const previousTime = location.state?.previousTimeSpent || 0;
        setTotalTimeSpent(elapsedSeconds + previousTime);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  const pauseLesson = () => {
    stopTimer();
    setIsPaused(true);
    navigate("/resume", { 
      state: { 
        timeSpent, 
        previousTimeSpent: totalTimeSpent - timeSpent,
        progress, 
        currentIndex,
        correctAttempts,
        incorrectAttempts
      } 
    });
  };

  const resetLesson = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setShuffledCharacters([...charactersToLearn].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setProgress(0);
    setIsCorrect(null);
    setIsLessonComplete(false);
    setTimeSpent(0);
    setTotalTimeSpent(0);
    setCorrectAttempts(0);
    setIncorrectAttempts(0);
    
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
        setTimeSpent(elapsedSeconds);
        setTotalTimeSpent(elapsedSeconds);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!location.state?.timeSpent) {
      startTimeRef.current = Date.now();
    }
    startTimer();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (isLessonComplete) {
      stopTimer();
    }
  }, [isLessonComplete]);

  useEffect(() => {
    if (location.state) {
      const { timeSpent, progress, currentIndex, previousTimeSpent, correctAttempts, incorrectAttempts } = location.state;
      
      if (timeSpent !== undefined) setTimeSpent(timeSpent);
      if (progress !== undefined) setProgress(progress);
      if (currentIndex !== undefined) setCurrentIndex(currentIndex);
      if (previousTimeSpent !== undefined) setTotalTimeSpent(previousTimeSpent);
      if (correctAttempts !== undefined) setCorrectAttempts(correctAttempts);
      if (incorrectAttempts !== undefined) setIncorrectAttempts(incorrectAttempts);
    }

    if (location.state?.timeSpent) {
      window.history.replaceState({}, document.title);
    }

    startTimer();
    return () => stopTimer();
  }, [location.state]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      } else {
        handleKeyPress(event.key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    if (!isLessonComplete && !isPaused) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentCharacter, isShiftPressed, isLessonComplete, isPaused]);

  async function storeScore(){  
    
    //Caculates user score for this task based off accuracy and time spent 
    let userAccuracy = ((correctAttempts/(correctAttempts + incorrectAttempts))*100);
    let userPoints = userAccuracy/ (timeSpent*.1);
    userPoints = Math.trunc(userPoints);
    console.log(user);
    
    if(user?.id != undefined){
      await fetch("http://localhost:3232/storeScore?userid="+user?.id+"&score="+userPoints);
    }
  }

  if (isLessonComplete) {
    storeScore();
    return (
      <ResultsPage
        correctAttempts={correctAttempts}
        incorrectAttempts={incorrectAttempts}
        timeSpent={totalTimeSpent}
        resetLesson={resetLesson}
      />
    );
  }

  return (
    <div>
      <div className={styles["learn-page"]}>
        <div className={styles["linkButtons"]}> 
          <Link to="/">
            <button
              style={{
                padding: "10px 15px",
                marginTop: "0px",
                marginLeft: "1200px",
                backgroundColor: "rgba(160, 222, 68, 0.271)",
                font: "Apple SD Gothic Neo",
                borderRadius: "30px",
                fontSize: "1rem",
                whiteSpace: "nowrap",
              }}
              aria-label="Back to Homepage"
            >
              Back to Homepage
            </button>
          </Link>
          <SignedIn>
            <SignOutButton>
              <Link to="/">
                <button
                  style={{
                    padding: "10px 15px",
                    marginTop: "0px",
                    marginLeft: "10px",
                    backgroundColor: "rgba(160, 222, 68, 0.271)",
                    font: "Apple SD Gothic Neo",
                    borderRadius: "30px",
                    fontSize: "1rem",
                    whiteSpace: "nowrap",
                  }}
                  aria-label="Sign Out"
                >
                  Sign Out
                </button>
              </Link>
            </SignOutButton>
          </SignedIn>
        </div>
        <h1>Learn Korean</h1>
        <ProgressBar data-testid="progress-bar" progress={progress} />
        <div data-testid="card-container" className={styles["card-container"]}>
          <Card
            data-testid="card"
            character={currentCharacter.character}
            romanization={currentCharacter.roman_representation}
            highlight={isCorrect}
            showHint={showHints}
          />
          <div className={styles["toggle-container"]} data-testid="toggle-container">
            <div
              className={`${styles["slider"]} ${
                showHints ? styles["slider-on"] : styles["slider-off"]
              }`}
              data-testid="toggle-slider"
              onClick={() => setShowHints(!showHints)}
            >
              <div className={styles["slider-thumb"]} data-testid="toggle-thumb"></div>
            </div>
            <span className={styles["toggle-label"]} data-testid="toggle-label">
              {showHints ? "Hints On" : "Hints Off"}
            </span>
          </div>
        </div>

        <div className={styles["timer-container"]}>
          <img 
            src={"/pause.png"} 
            alt="Pause"
            onClick={pauseLesson}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              marginRight: "10px",
              verticalAlign: "middle"
            }}
          />
          <p data-testid="timer-text" className={styles["timer-text"]}>
            Time: {Math.floor(totalTimeSpent / 60)}:{("0" + (totalTimeSpent % 60)).slice(-2)}
          </p>
        </div>
      </div>
      
      <KoreanKeyboard onClick={handleKeyPress} />
    </div>
  );
};

export default LearnPage;