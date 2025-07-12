import React, {useState , useEffect , useRef} from 'react'
import { loadWords } from '../utils/loadWords'
import TimerPanel from './TimerPanel';
import ResultsModal from './ResultsModal';

const TypingBox = () => {
    const [wordList , setWordList] = useState([]);
    const [isLoading , setIsLoading] = useState(true);
    const [typedInput, setTypedInput] = useState('');
    const [activeWordIndex, setActiveWordIndex] = useState(0);
    const [wordStatus, setWordStatus] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(true);
    const [typedHistory, setTypedHistory] = useState([]);
    const [selectedTime, setSelectedTime] = useState(30); 
    const [timeLeft, setTimeLeft] = useState(30);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [skippedCount, setSkippedCount] = useState(0);
    const [allWords, setAllWords] = useState([]);               
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [chunkIndex, setChunkIndex] = useState(0);
    const inputRef = useRef(null);


    const loadInitialWords = async () => {
      setIsLoading(true);
      try {
        const words = await loadWords();
        const shuffled = [...words];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selected = shuffled.slice(0, 1000); 
        setAllWords(selected);
        setWordList(selected.slice(0, 50));
        setWordStatus(new Array(50).fill(null));
        setActiveWordIndex(0);
        setTypedInput("");
        setCurrentChunkIndex(0);
      } catch (err) {
        console.error("Error loading words:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    
    useEffect(() => {
      loadInitialWords();
    }, []);    

    const showNextChunk = () => {
      const nextIndex = (chunkIndex + 1) % (allWords.length / 50); // wrap around
      const start = nextIndex * 50;
      const end = start + 50;
      const nextChunk = allWords.slice(start, end);
    
      setWordList(nextChunk);
      setWordStatus(new Array(50).fill(null));
      setActiveWordIndex(0);
      setTypedInput("");
      setChunkIndex(nextIndex);
    };
    


      useEffect(() => {
        if (wordList.length > 0 && inputRef.current) {
          inputRef.current.focus();
        }
      }, [wordList]);
  
      useEffect(() => {
        if(!isSessionActive) return;

        if(timeLeft === 0){
          setIsSessionActive(false);
          setIsInputFocused(false);
          return;
        }

        const timerId = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
      }, [isSessionActive, timeLeft]);

      useEffect(() => {
        setTimeLeft(selectedTime);
      }, [selectedTime]);

      const handleInputChange = (e) => {
      let value = e.target.value;
      setTypedInput(value);

      if (!isSessionActive && timeLeft > 0) {
        setIsSessionActive(true);
      }

      if (value.endsWith(" ")) {
        const trimmed = value.trim();
        evaluateWord(trimmed);
        setTypedInput("");
      }
    };


    const handleKeyDown = (e) => {
      if (e.key === "Backspace") {
        if (typedInput.length > 0) {
          return;
        }
    
        const prevIndex = activeWordIndex - 1;
    
        if (prevIndex >= 0 && wordStatus[prevIndex] === "correct") {
          e.preventDefault();
          return;
        }
    
        if (prevIndex >= 0) {
          e.preventDefault();
          setActiveWordIndex(prevIndex);
          setTypedInput(typedHistory[prevIndex] || "");
    
          const updatedStatus = [...wordStatus];
          for (let i = prevIndex + 1; i < updatedStatus.length; i++) {
            updatedStatus[i] = null;
          }
          setWordStatus(updatedStatus);
        }
      }
    };    
    

const evaluateWord = (input) => {
  if (activeWordIndex + 1 === wordList.length) {
    const nextChunkIndex = currentChunkIndex + 1;
    const start = nextChunkIndex * 50;
    const end = start + 50;
  
    if (start < allWords.length) {
      setCurrentChunkIndex(nextChunkIndex);
      setWordList(allWords.slice(start, end));
      setWordStatus(new Array(50).fill(null));
      setActiveWordIndex(0);
      setTypedHistory([]);
      setTypedInput("");
    }
    return;
  }

  const currentWord = wordList[activeWordIndex];
  const isCorrect = input === currentWord;

  if (!isCorrect && input === "") {
    if (skippedCount >= 0) {
      return; 
    }
    setSkippedCount(skippedCount + 1);
  }

  if (isCorrect) {
    setSkippedCount(0); 
  }

  const updatedStatus = [...wordStatus];
  updatedStatus[activeWordIndex] = isCorrect ? "correct" : "incorrect";
  setWordStatus(updatedStatus);

  const updatedTypedHistory = [...typedHistory];
  updatedTypedHistory[activeWordIndex] = input;
  setTypedHistory(updatedTypedHistory);

  setActiveWordIndex((prevIndex) => prevIndex + 1);
};

    
    
    

    const getWordClass = (index) => {
      if (index === activeWordIndex && isInputFocused) return "border-b border-cyan-400";
      if (wordStatus[index] === "correct") return "text-green-400";
      if (wordStatus[index] === "incorrect") return "text-red-400";
      return "text-gray-300";
    };
    

    const getCharClass = (char, typedChar) => {
      if (!typedChar) return "";
      if (char === typedChar) return "text-green-400";
      return "text-red-400";
    };

    const getInputForWord = (index) => {
      return index === activeWordIndex ? typedInput : typedHistory[index] || ''
    }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 font-mono">
      <h1 className="text-2xl font-bold mb-4 text-center text-cyan-400">
        TypeStreak
      </h1>

      <TimerPanel
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        timeLeft={timeLeft}
        isSessionActive={isSessionActive}
      />

      <div
        className="bg-[#252526] text-[#d4d4d4] border border-[#333] p-6 rounded-lg shadow-md min-h-[150px] leading-relaxed text-sm sm:text-base md:text-lg cursor-text"
        onClick={() => inputRef.current.focus()}
      >
        {isLoading ? (
          <p className="text-gray-500">Loading words...</p>
        ) : (
          <div className="flex flex-wrap gap-x-2">
            {wordList.map((word, index) => {
              
              if (index === activeWordIndex) {
                const inputForWord = getInputForWord(index);
                return (
                  <span key={index} className={getWordClass(index)}>
                    {word.split("").map((char, i) => {
                      const typedChar = inputForWord[i];
                      return (
                        <span key={i} className={getCharClass(char, typedChar)}>
                          {char}
                        </span>
                      );
                    })}
                    
                    {inputForWord.length > word.length && (
                      <span className="text-red-400">
                        {inputForWord.slice(word.length)}
                      </span>
                    )}
                  </span>
                );
              }

              
              return (
                <span key={index} className={getWordClass(index)}>
                  {word}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <input
        type="text"
        className="opacity-0 absolute"
        ref={inputRef}
        value={typedInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        disabled={isLoading}
        aria-label='Typing Input'
      />

    <div className="mt-8 flex justify-center">
      <button
        onClick={showNextChunk}
        disabled={isSessionActive}
        className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-semibold text-base rounded-xl shadow-lg hover:from-cyan-300 hover:to-cyan-500 hover:shadow-cyan-400/40 hover:scale-105 transition-all duration-200"
      >
        ↺
      </button>
    </div>


      {!isSessionActive && timeLeft === 0 && (
        <ResultsModal
          wordStatus={wordStatus}
          selectedTime={selectedTime}
          onRestart={() => {
            loadInitialWords();
            setWordStatus([]);
            setTypedHistory([]);
            setSkippedCount(0);
            setIsSessionActive(false);
            setIsInputFocused(true);
            setTimeLeft(selectedTime);
          }}
        />
      )}
      
    </div>
  )
}

export default TypingBox
