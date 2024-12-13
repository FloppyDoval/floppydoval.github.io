import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/PracticePage.module.scss';
import sentencesData from '../../data/Korean_sentences.json';
import KoreanKeyboard from '../keyboard';
import ProgressBar from '../ProgressBar';
import shuffleArray from '../../util/shuffle';
import GameInstructions from '../GameInfo';
import { useUser } from '@clerk/clerk-react';

const PracticePage = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [sentences, setSentences] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [currSentence, setCurrSentence] = useState([]);
  const [currTranslation, setCurrTranslation] = useState([]);
  const [correctInput, setCorrectInput] = useState('');
  const [correctStates, setCorrectStates] = useState([]);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  
  // Timer-related states
  const [timeSpent, setTimeSpent] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const inputRef = useRef(null);

  // Statistics tracking
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const user = useUser().user;

  // Start timer
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
      const totalSeconds = accumulatedTimeRef.current + elapsedSeconds;
      
      setTimeSpent(elapsedSeconds);
      setTotalTimeSpent(totalSeconds);
    }, 1000);
  };

  // Stop timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      // Add the current session time to accumulated time
      if (startTimeRef.current) {
        const currentTime = Date.now();
        const additionalSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
        accumulatedTimeRef.current += additionalSeconds;
      }
    }
    startTimeRef.current = null;
  };

  // Pause lesson
  const pauseLesson = () => {
    if (isLessonComplete) return;

    setIsPaused(!isPaused);
    if (!isPaused) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  // Continue lesson from pause screen
  const continueLesson = () => {
    setIsPaused(false);
    startTimer();
  };

  // Navigate back to previous screen or home
  const returnToMenu = () => {
    navigate('/');
  };

  // Reset lesson
  const resetLesson = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    startTimeRef.current = null;
    accumulatedTimeRef.current = 0; // Reset accumulated time
    setTimeSpent(0);
    setTotalTimeSpent(0);
  
    // Reset all other game state
    const filteredSentences = sentencesData.sentences
      .filter(sentence => sentence.level.toLowerCase() === level?.toLowerCase())
      .map(item => ({
        korean: item.sentence.split(' '),
        translations: item.word_translation
      }));
  
    const shuffledSentences = shuffleArray(filteredSentences).slice(0, 5);
  
    setSentences(shuffledSentences.map(item => item.korean));
    setTranslations(shuffledSentences.map(item => item.translations));
  
    if (shuffledSentences.length > 0) {
      setCurrSentence(shuffledSentences[0].korean);
      setCurrTranslation(shuffledSentences[0].translations);
      setCorrectInput(shuffledSentences[0].korean[0]);
      setCorrectStates(shuffledSentences.map(sentence =>
        sentence.korean.map(() => false)
      ));
    }
  
    setSentenceIndex(0);
    setWordIndex(0);
    setProgress(0);
    setIsLessonComplete(false);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setIncorrectAttempts(0);
    setAccuracy(0);
  
    setTimeout(() => {
      startTimer();
    }, 0);
  };

  // Initial setup and timer management
  useEffect(() => {
    if (location.state) {
      const { timeSpent, previousTimeSpent } = location.state;

      if (previousTimeSpent !== undefined) {
        accumulatedTimeRef.current = previousTimeSpent;
        setTotalTimeSpent(previousTimeSpent);
      }

      // Restore lesson state
      if (timeSpent !== undefined) setTimeSpent(timeSpent);
      if (progress !== undefined) setProgress(progress);
      if (sentenceIndex !== undefined) setSentenceIndex(sentenceIndex);
      if (wordIndex !== undefined) setWordIndex(wordIndex);
      if (currSentence) setCurrSentence(currSentence);
      if (sentences) setSentences(sentences);
      if (translations) setTranslations(translations);

      // Clear the state to prevent reusing
      window.history.replaceState({}, document.title);
    } else {
      // Normal initial setup
      const filteredSentences = sentencesData.sentences
        .filter(sentence => sentence.level.toLowerCase() === level?.toLowerCase())
        .map(item => ({
          korean: item.sentence.split(' '),
          translations: item.word_translation
        }));

      const shuffledSentences = shuffleArray(filteredSentences).slice(0, 5);

      setSentences(shuffledSentences.map(item => item.korean));
      setTranslations(shuffledSentences.map(item => item.translations));

      if (shuffledSentences.length > 0) {
        setCurrSentence(shuffledSentences[0].korean);
        setCurrTranslation(shuffledSentences[0].translations);
        setCorrectInput(shuffledSentences[0].korean[0]);
        setCorrectStates(shuffledSentences.map(sentence =>
          sentence.korean.map(() => false)
        ));
      }
    }

    // Start timer
    startTimer();

    return () => {
      stopTimer();
    };
  }, [level, location.state]);
  

  // Stop timer when lesson is complete
  useEffect(() => {
    if (isLessonComplete) {
      stopTimer();
    }
  }, [isLessonComplete]);

  const handleKeyPress = (key) => {
    if (isLessonComplete || isPaused) return;
  
    if (key === ' ') {
      // Increment total attempts when space is pressed
      setTotalAttempts(prev => prev + 1);
      checkInput();
    } else {
      setUserInput(prev => prev + key);
      setIsIncorrect(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    setIsIncorrect(false);
  
    if (value.endsWith(' ')) {
      // Increment total attempts when space is pressed in input
      setTotalAttempts(prev => prev + 1);
      
      checkInput();
    }
  };

  const checkInput = () => {
    const trimmedInput = userInput.trim();
    if (trimmedInput === correctInput) {
      handleCorrectInput();
    } else {
      handleIncorrectInput();
    }
  };

  const handleCorrectInput = () => {
    const updatedStates = [...correctStates];
    updatedStates[sentenceIndex][wordIndex] = true;
    setCorrectStates(updatedStates);

    // Update attempts and accuracy
    setCorrectAttempts(prev => prev + 1);
    
    // Calculate accuracy
    const newTotalAttempts = totalAttempts + 1;
    const newCorrectAttempts = correctAttempts + 1;
    const newAccuracy = Math.round((newCorrectAttempts / newTotalAttempts) * 100);
    setAccuracy(newAccuracy);

    if (wordIndex + 1 < currSentence.length) {
      setWordIndex(prev => prev + 1);
      setCorrectInput(currSentence[wordIndex + 1]);
    } else {
      const nextIndex = sentenceIndex + 1;
      if (nextIndex < sentences.length) {
        setSentenceIndex(nextIndex);
        setCurrSentence(sentences[nextIndex]);
        setCurrTranslation(translations[nextIndex]);
        setWordIndex(0);
        setCorrectInput(sentences[nextIndex][0]);
        setProgress((nextIndex / sentences.length) * 100);
      } else {
        storeScore();
        setIsLessonComplete(true);
        setProgress(100);
      }
    }
    setUserInput('');
  };

  const handleIncorrectInput = () => {
    setIsIncorrect(true);
    setUserInput('');

    setIncorrectAttempts(prev => prev + 1);
    
    const newTotalAttempts = totalAttempts + 1;
    const newIncorrectAttempts = incorrectAttempts + 1;
    const newAccuracy = Math.round((correctAttempts / newTotalAttempts) * 100);
    setAccuracy(newAccuracy);
  };

  const handleBackspace = () => {
    setUserInput(prev => prev.slice(0, -1));
    setIsIncorrect(false);
  };

  // Function to get word translation from word_translation instead of sentence-level translation
  const getWordTranslation = (idx) => {
    const word = currSentence[idx];
    return currTranslation[word] || "No translation available";
  };

  if (sentences.length === 0) {
    return <div className={styles['page-alignment']}>Loading sentences...</div>;
  }

  // New function to store score
  async function storeScore() {
    
    // Calculate user points based on accuracy, time spent and level
    let userPoints = (accuracy / (totalTimeSpent * 0.1));
    
    if(location.pathname === '/practicePage/beginner'){
      userPoints = userPoints*1.5;
      
    }
    if(location.pathname === '/practicePage/intermediate'){
      userPoints = userPoints*2.5;
    }
    if(location.pathname === '/practicePage/advanced'){
      userPoints = userPoints*3.5;
    }
    userPoints = Math.trunc(userPoints);
    if (user?.id !== undefined) {
      try {
        await fetch(`http://localhost:3232/storeScore?userid=${user.id}&score=${userPoints}`);
      } catch (error) {
        console.error('Failed to store score:', error);
      }
    }
  }

  return (
    <div className={styles['practice-page']}>
      <div className="flex items-center gap-4">
        <h1>Practice Korean ({level})</h1>
      </div>
      <GameInstructions />
      <ProgressBar progress={progress} />

      

      {/* Pause Overlay */}
      {isPaused && !isLessonComplete && (
        <div className={styles['pause-overlay']}>
          <div className={styles['pause-modal']}>
            <h2>Lesson Paused</h2>
            <p>Your lesson is currently on hold.</p>
            <div className={styles['pause-actions']}>
              <button 
                onClick={continueLesson} 
                className={styles['continue-btn']}
              >
                Continue Lesson
              </button>
              <button 
                onClick={returnToMenu} 
                className={styles['return-btn']}
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the existing render logic */}
      <div className={styles['sentence-container']}>
        {currSentence.map((word, idx) => (
          <span
            key={idx}
            className={`${styles.word} ${
              correctStates[sentenceIndex][idx] 
                ? styles.correct
                : idx === wordIndex
                  ? isIncorrect 
                    ? styles.incorrect
                    : ''
                  : ''
            }`}
            style={{
              color: idx < wordIndex || correctStates[sentenceIndex][idx] ? '#2f7b2f' : 'inherit',
              position: 'relative',
              opacity: isPaused ? 0.5 : 1
            }}
            data-tooltip={getWordTranslation(idx)}
          >
            {word}
            <span className={styles.tooltip}>
              {getWordTranslation(idx)}
            </span>
          </span>
        ))}
      </div>


      <div className={styles.container}>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className={`${styles.textbox} ${isIncorrect ? styles.incorrect : ''}`}
          placeholder={correctInput}
          autoFocus
          disabled={isPaused || isLessonComplete}
        />
        {isIncorrect && (
          <span className={styles['clear-input']} onClick={() => setUserInput('')}>
            x
          </span>
        )}
      </div>

      {/* Add timer display with pause button */}
      <div className={styles['timer-container']}>
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
        <p className={styles['timer-text']}>
          Time: {Math.floor(totalTimeSpent / 60)}:{("0" + (totalTimeSpent % 60)).slice(-2)}
        </p>
      </div>

      <KoreanKeyboard 
        onClick={handleKeyPress} 
        onBackspace={handleBackspace}
        disabled={isPaused || isLessonComplete}
      />

      {isLessonComplete && (
        <div className={styles['completion-overlay']}>
          <div className={styles['completion-modal']}>
            <h2>Lesson Completed</h2>
            <div className={styles['stats-container']}>
              <div className={styles['stat-item']}>
                <span className={styles['stat-label']}>Total Time:</span>
                <span className={styles['stat-value']}>
                  {Math.floor(totalTimeSpent / 60)}:{("0" + (totalTimeSpent % 60)).slice(-2)}
                </span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-label']}>Total Attempts:</span>
                <span className={styles['stat-value']}>{totalAttempts}</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-label']}>Correct Attempts:</span>
                <span className={styles['stat-value']}>{correctAttempts}</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-label']}>Incorrect Attempts:</span>
                <span className={styles['stat-value']}>{incorrectAttempts}</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-label']}>Accuracy:</span>
                <span className={styles['stat-value']}>{accuracy}%</span>
              </div>
            </div>
            <div className={styles['completion-actions']}>
              <button 
                onClick={resetLesson} 
                className={styles['reset-btn']}
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/')} 
                className={styles['return-btn']}
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePage;
