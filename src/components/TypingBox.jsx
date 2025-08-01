import React, { useState, useEffect, useRef } from "react";
import { loadWords } from "../utils/loadWords";
import TimerPanel from "./TimerPanel";
import ResultsModal from "./ResultsModal";
import OptionSelector from "./OptionSelector";
import { mutateWords } from "../utils/mutateWords";
import { MdAccessTime } from "react-icons/md";
import ThemeIcon from "./ThemeIcon";
import { useTheme } from "../context/ThemeContext";
import { colorClasses } from "../utils/colorClasses";

const CHUNK_SIZE = 30;

const TypingBox = () => {
  const [wordList, setWordList] = useState([]);
  const [typedInput, setTypedInput] = useState("");
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
    symbols: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);
  const { primaryColor } = useTheme();
  const optionsKey = Object.values(options).join("-");

  const loadInitialWords = async () => {
    try {
      setIsLoading(true);
      const words = await loadWords();
      const shuffled = [...words];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setRawWords(shuffled);
      const mutated = mutateWords(shuffled, options);
      const selected = mutated.slice(0, 5000);
      setAllWords(selected);
      setWordList(selected.slice(0, CHUNK_SIZE));
      setWordStatus(new Array(CHUNK_SIZE).fill(null));
      setActiveWordIndex(0);
      setTypedInput("");
      setCurrentChunkIndex(0);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading words:", err);
    }
  };

  useEffect(() => {
    loadInitialWords();
  }, []);

  useEffect(() => {
    if (rawWords.length === 0 || isSessionActive) return;

    const start = Math.floor(Math.random() * (rawWords.length - 5000));
    const chunk = rawWords.slice(start, start + 5000);
    const mutated = mutateWords(chunk, options);
    const selected = mutated.slice(0, 5000);

    setAllWords(selected);
    setWordList(selected.slice(0, CHUNK_SIZE));
    setWordStatus(new Array(CHUNK_SIZE).fill(null));
    setTypedInput("");
    setTypedHistory([]);
    setActiveWordIndex(0);
    setCurrentChunkIndex(0);
  }, [options]);

  const showNextChunk = () => {
    const nextIndex =
      (currentChunkIndex + 1) % Math.ceil(allWords.length / CHUNK_SIZE);
    const start = nextIndex * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const nextChunk = allWords.slice(start, end);

    setWordList(nextChunk);
    setWordStatus(new Array(CHUNK_SIZE).fill(null));
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
    if (!isSessionActive) return;

    if (timeLeft === 0) {
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
      const start = nextChunkIndex * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;

      if (start < allWords.length) {
        setCurrentChunkIndex(nextChunkIndex);
        setWordList(allWords.slice(start, end));
        setWordStatus(new Array(CHUNK_SIZE).fill(null));
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
    if (index === activeWordIndex && isInputFocused)
      return `border-b ${colorClasses[primaryColor].border}`;
    if (wordStatus[index] === "correct") return "text-white";
    if (wordStatus[index] === "incorrect") {
      return "border-b border-red-400";
    }
    return "text-gray-600";
  };

  const getCharClass = (char, typedChar) => {
    if (!typedChar) return "text-gray-600";
    if (char === typedChar) return "text-white";
    return "text-red-400";
  };

  const getInputForWord = (index) => {
    return index === activeWordIndex ? typedInput : typedHistory[index] || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className={`w-10 h-10 border-4 ${colorClasses[primaryColor]?.border} border-t-transparent rounded-full animate-spin`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11131a] text-white font-mono px-4 sm:px-8 py-10">
      {!isSessionActive && (
      <div className="absolute top-4 right-4">
        <ThemeIcon />
      </div>
  )}
      <div className="max-w-5xl mx-auto flex flex-col gap-10 relative">
        <div className="min-h-[220px] flex flex-col gap-6 items-center justify-center">
          {!isSessionActive && (
            <>
              <h1 className= {`text-center text-4xl sm:text-5xl font-extrabold tracking-wide ${colorClasses[primaryColor]?.text} drop-shadow-lg`}>
                TypeStreak
              </h1>

              <div className="w-full mt-10">
                <div className="w-full flex flex-col sm:flex-row justify-between items-baseline gap-4 px-2 sm:px-4">
                  <div className="flex-1">
                    <TimerPanel
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                      timeLeft={timeLeft}
                      isSessionActive={isSessionActive}
                    />
                  </div>

                  <div className="flex-1">
                    <OptionSelector
                      options={options}
                      setOptions={(newOptions) => {
                        if (!isSessionActive) setOptions(newOptions);
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className="relative min-h-[140px] text-[1.6rem] sm:text-[2rem] leading-[2.6rem] tracking-wide font-medium text-gray-600 cursor-text outline-none pt-4"
          onClick={() => inputRef.current?.focus()}
        >
          {isSessionActive && (
            <div className="absolute -top-8 left-0 text-gray-300 flex items-center gap-2 text-base sm:text-lg">
              <MdAccessTime className={`text-xl ${colorClasses[primaryColor]?.text}`} />
              <span
                className={`font-semibold tracking-wide ${
                  timeLeft <= 10
                    ? "text-red-400 animate-pulse"
                    : colorClasses[primaryColor]?.text}
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          )}

          <div
            key={currentChunkIndex + "-" + optionsKey}
            className="flex flex-wrap gap-x-3 gap-y-4 animate-fadeIn transition-opacity duration-300"
          >
            {wordList.map((word, index) => {
              const isActive = index === activeWordIndex;
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
                    <span className="text-red-500">
                      {inputForWord.slice(word.length)}
                    </span>
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

        {!isSessionActive && (
          <div className="flex justify-center">
            <button
              onClick={showNextChunk}
              disabled={isSessionActive}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r ${colorClasses[primaryColor]?.from} ${colorClasses[primaryColor]?.to} text-white font-semibold tracking-wide shadow-md transition-all duration-200 hover:scale-105 hover:brightness-110 disabled:opacity-50`}
            >
              ↺
            </button>
          </div>
        )}

        {!isSessionActive && timeLeft === 0 && (
          <ResultsModal
            wordStatus={wordStatus}
            selectedTime={selectedTime}
            onRestart={() => {
              const nextIndex =
                (currentChunkIndex + 1) %
                Math.ceil(allWords.length / CHUNK_SIZE);
              const start = nextIndex * CHUNK_SIZE;
              const end = start + CHUNK_SIZE;

              setWordList(allWords.slice(start, end));
              setWordStatus(new Array(CHUNK_SIZE).fill(null));
              setTypedHistory([]);
              setSkippedCount(0);
              setIsSessionActive(false);
              setIsInputFocused(true);
              setTimeLeft(selectedTime);
              setTypedInput("");
              setCurrentChunkIndex(nextIndex);
              setActiveWordIndex(0);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TypingBox;
