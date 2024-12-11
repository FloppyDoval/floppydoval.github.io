import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../styles/PracticePage.module.scss';
import sentencesData from '../../data/Korean_sentences.json';
import KoreanKeyboard from '../keyboard';
import ProgressBar from '../ProgressBar';
import shuffleArray from '../../util/shuffle';
import GameInstructions from '../GameInfo';

const PracticePage = () => {
  const { level } = useParams();
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
  const inputRef = useRef(null);

  useEffect(() => {
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
  }, [level]);

  const handleKeyPress = (key) => {
    if (isLessonComplete) return;

    if (key === ' ') {
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
        setIsLessonComplete(true);
        setProgress(100);
      }
    }
    setUserInput('');
  };

  const handleIncorrectInput = () => {
    setIsIncorrect(true);
    setUserInput('');
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

  return (
    <div className={styles['practice-page']}>
      <div className="flex items-center gap-4">
        <h1>Practice Korean ({level})</h1>
      </div>
      <GameInstructions />
      <ProgressBar progress={progress} />

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
              position: 'relative'
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
        />
        {isIncorrect && (
          <span className={styles['clear-input']} onClick={() => setUserInput('')}>
            ×
          </span>
        )}
      </div>

      <KoreanKeyboard 
        onClick={handleKeyPress} 
        onBackspace={handleBackspace}
      />

      {isLessonComplete && (
        <div className={styles['completion-message']}>
          Lesson Complete! Great Job! 🎉
        </div>
      )}
    </div>
  );
};

export default PracticePage;