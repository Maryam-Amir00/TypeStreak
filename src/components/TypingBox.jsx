import React, {useState , useEffect , useRef} from 'react'
import { loadWords } from '../utils/loadWords'
import TimerPanel from './TimerPanel';
import ResultsModal from './ResultsModal';
import OptionSelector from './OptionSelector';
import { mutateWords } from '../utils/mutateWords';


const TypingBox = () => {
    const [wordList , setWordList] = useState([]);
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
    const [rawWords, setRawWords] = useState([]);
    const [options, setOptions] = useState({
      capitalization: false,
      punctuation: false,
      numbers: false,
      symbols: false
    });    
    const inputRef = useRef(null);
    const optionsKey = Object.values(options).join("-");



    const loadInitialWords = async () => {
      try {
        const words = await loadWords();
        const shuffled = [...words];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setRawWords(shuffled); 
        const mutated = mutateWords(shuffled, options);
        const selected = mutated.slice(0, 1000);
        setAllWords(selected);
        setWordList(selected.slice(0, 50));
        setWordStatus(new Array(50).fill(null));
        setActiveWordIndex(0);
        setTypedInput("");
        setCurrentChunkIndex(0);
      } catch (err) {
        console.error("Error loading words:", err);
      }
    };    
    
    
    useEffect(() => {
      loadInitialWords();
    }, []);    

    useEffect(() => {
      if (!isSessionActive) {
        loadInitialWords();
      }
    }, [options]);    
    
      const showNextChunk = () => {
      const nextIndex = (currentChunkIndex + 1) % Math.ceil(allWords.length / 50);
      const start = nextIndex * 50;
      const end = start + 50;
      const nextChunk = allWords.slice(start, end);
    
      setWordList(nextChunk);
      setWordStatus(new Array(50).fill(null));
      setActiveWordIndex(0);
      setTypedInput("");
      setTypedHistory([]);
      setCurrentChunkIndex(nextIndex);
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
      <div className="min-h-screen bg-[#11131a] text-white font-mono px-4 sm:px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
    
          
          <h1 className="text-center text-4xl sm:text-5xl font-extrabold tracking-wide text-cyan-400 drop-shadow-lg">
            TypeStreak
          </h1>
    
         
          <TimerPanel
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          timeLeft={timeLeft}
          isSessionActive={isSessionActive}
        />

          <OptionSelector
            options={options}
            setOptions={(newOptions) => {
              if (!isSessionActive) setOptions(newOptions);
            }}
          />


    
          
          <div
            className="bg-[#1b1e2c] p-6 sm:p-8 rounded-2xl ring-1 ring-cyan-500/10 hover:ring-cyan-400/30 transition-all duration-200 min-h-[200px] tracking-wide cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <div
                key={currentChunkIndex + '-' + optionsKey}
                className="flex flex-wrap gap-x-3 gap-y-4 animate-fadeIn transition-opacity duration-300"
              >
                {wordList.map((word, index) => {
                  const isActive = index === activeWordIndex;
                  const inputForWord = getInputForWord(index);

                  return (
                    <span key={index} className={getWordClass(index)}>
                      {word.split('').map((char, i) => {
                        const typedChar = inputForWord[i];
                        return (
                          <span key={i} className={getCharClass(char, typedChar)}>
                            {char}
                          </span>
                        );
                      })}
                      {inputForWord.length > word.length && (
                        <span className="text-red-500">{inputForWord.slice(word.length)}</span>
                      )}
                    </span>
                  );
                })}
              </div>
          </div>
    
       
          <input
            type="text"
            className="absolute opacity-0 pointer-events-none"
            ref={inputRef}
            value={typedInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
    
          <div className="flex justify-center">
          <button
            onClick={showNextChunk}
            disabled={isSessionActive}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-700 text-white font-semibold tracking-wide shadow-md transition-all duration-200 hover:from-cyan-400 hover:to-cyan-600 hover:shadow-cyan-500/40 hover:scale-105 disabled:opacity-50"
          >
            ↺ Load New Words
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
              setTypedInput("");
              setCurrentChunkIndex(0);
            }}            
          />
        )}
        </div>
      </div>
    );
    
    
}

export default TypingBox
