import { ResponseState } from "./responseState";

export const toNext = (responseState: ResponseState) => {
    const { wordIndex, currSentence, sentences, sentenceIndex, setWordIndex, setCorrectInput } =
      responseState;
  
    if (wordIndex + 1 < currSentence.length) {
      setWordIndex(wordIndex + 1);
      setCorrectInput(currSentence[wordIndex + 1]);
    } else {
      if (sentenceIndex + 1 < sentences.length) {
        responseState.setSentenceIndex(sentenceIndex + 1);
        responseState.setCurrSentence(sentences[sentenceIndex + 1]);
        responseState.setWordIndex(0);
        responseState.setCorrectInput(sentences[sentenceIndex + 1][0]);
      } else {
        responseState.setProgress(sentences.length); // Complete
      }
    }
  };
  
  export const resetResponse = (responseState: ResponseState) => {
    responseState.setUserInput("");
  };
  