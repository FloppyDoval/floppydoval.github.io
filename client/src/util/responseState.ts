import { useState, useRef } from "react";

export interface ResponseState {
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  sentences: string[][];
  sentenceIndex: number;
  setSentenceIndex: React.Dispatch<React.SetStateAction<number>>;
  currSentence: string[];
  setCurrSentence: React.Dispatch<React.SetStateAction<string[]>>;
  wordIndex: number;
  setWordIndex: React.Dispatch<React.SetStateAction<number>>;
  correctInput: string;
  setCorrectInput: React.Dispatch<React.SetStateAction<string>>;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  correctStates: [boolean, React.Dispatch<React.SetStateAction<boolean>>][][];
}

export const initializeResponseState = (sentences: string[][]): ResponseState => {
  const [progress, setProgress] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctInput, setCorrectInput] = useState(sentences[0][0]);
  const [currSentence, setCurrSentence] = useState(sentences[0]);

  const correctStates = sentences.map((sentence) =>
    sentence.map(() => {
      const [isCorrect, setIsCorrect] = useState(false);
      return [isCorrect, setIsCorrect];
    })
  );

  return {
    progress,
    setProgress,
    sentences,
    sentenceIndex,
    setSentenceIndex,
    currSentence,
    setCurrSentence,
    wordIndex,
    setWordIndex,
    correctInput,
    setCorrectInput,
    userInput,
    setUserInput,
    correctStates,
  };
};
