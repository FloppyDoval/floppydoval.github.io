import React from "react";
import styles from "../../styles/ResultsPage.module.scss";

const ResultsPage = ({ correctAttempts, incorrectAttempts, resetLesson, timeSpent }: any) => {
  const totalAttempts = correctAttempts + incorrectAttempts;
  const accuracy = totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(2) : 0;

  const minutes = Math.floor(timeSpent / 60); // Convert to minutes
  const seconds = timeSpent % 60; // Get seconds

  return (
    <div className={styles["results-page"]}>
      <h1>Lesson Complete!</h1>
      <p aria-label="Total">Total Keys Practiced: {totalAttempts}</p>
      <p aria-label="Correct">Correct Keys: {correctAttempts}</p>
      <p aria-label="Incorrect">Incorrect Keys: {incorrectAttempts}</p>
      <p aria-label="Accuracy">Accuracy: {accuracy}%</p>
      <p aria-label="Time Spent">Time Spent: {minutes}m {seconds}s</p>
      <button onClick={resetLesson} className={styles["reset-button"]} aria-label="Try Again">
        Try Again
      </button>
    </div>
  );
};

export default ResultsPage;
