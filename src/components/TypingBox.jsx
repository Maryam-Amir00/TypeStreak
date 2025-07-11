import React, {useState , useEffect , useRef} from 'react'
import { loadWords } from '../utils/loadWords'
import TimerPanel from './TimerPanel';

const TypingBox = () => {
    const [wordList , setWordList] = useState([]);
    const [isLoading , setIsLoading] = useState(true);
    const [typedInput, setTypedInput] = useState('');
    const [activeWordIndex, setActiveWordIndex] = useState(0);
    const [wordStatus, setWordStatus] = useState([]);
    const [hasJumpedBack, setHasJumpedBack] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(true);
    const [typedHistory, setTypedHistory] = useState([]);
    const [selectedTime, setSelectedTime] = useState(30); 
    const [timeLeft, setTimeLeft] = useState(30);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const inputRef = useRef(null);


    const loadWordBatch = () => {
      setIsLoading(true);
      loadWords()
        .then((words) => {
          const maxStart = Math.max(0, words.length - 50);
          const randomStart = Math.floor(Math.random() * maxStart);
          const selected = words.slice(randomStart, randomStart + 50);
  
          setWordList(selected);
          setWordStatus(new Array(50).fill(null));
          setActiveWordIndex(0);
          setTypedInput("");
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading words.txt:", err);
          setIsLoading(false);
        });
    };

    useEffect(() => {
        loadWordBatch();
    }, []);


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
      value = value.replace(/\s+$/, ' ');
      setTypedInput(value);
      setHasJumpedBack(false);

      if(!isSessionActive && timeLeft > 0){
        setIsSessionActive(true);
      }

      if(value.endsWith(" ") && value.trim().length > 0){
        evaluateWord(value.trim());
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "Backspace" &&
        typedInput.length === 0 &&
        activeWordIndex > 0 &&
        !hasJumpedBack
      ) {
        const prevIndex = activeWordIndex - 1;
        setActiveWordIndex(prevIndex);
        setTypedInput(typedHistory[prevIndex] || "");
        setHasJumpedBack(true);
  
        const updatedStatus = [...wordStatus];
        for (let i = prevIndex + 1; i < updatedStatus.length; i++) {
          updatedStatus[i] = null;
        }
        setWordStatus(updatedStatus);
      }
    };
    
    

    const evaluateWord = (input) => {
      if (activeWordIndex >= wordList.length - 1) {
        setIsLoading(true);
        loadWordBatch();
        return;
      }
      const currentWord = wordList[activeWordIndex];
      if (input.length !== currentWord.length) {
        return;
      }
      const isCorrect = input === currentWord;
      const updatedStatus = [...wordStatus];
      updatedStatus[activeWordIndex] = isCorrect ? "correct" : "incorrect";
      setWordStatus(updatedStatus);

      const updatedTypedHistory = [...typedHistory];
      updatedTypedHistory[activeWordIndex] = input; 
      setTypedHistory(updatedTypedHistory);

      setTypedInput("");
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

    </div>
  )
}

export default TypingBox
