import React, { useState, useEffect, useRef } from "react";
import { loadWords } from "../utils/loadWords.js";
import TimerPanel from "./TimerPanel.js";
import ResultsModal from "./ResultsModal.js";
import OptionSelector from "./OptionSelector.js";
import { mutateWords } from "../utils/mutateWords.js";
import { MdAccessTime } from "react-icons/md";
import ThemeIcon from "./ThemeIcon.js";
import { useTheme } from "../context/ThemeContext.js";
import { colorClasses } from "../utils/colorClasses.js";
import type { OptionsType } from "./OptionSelector.js";
import NavBar from "./Navbar.js";
import supabase from "../utils/supabaseClient.js";
import { useAuth } from "../context/AuthContext.js";

const VISIBLE_WORD_COUNT = 60;

const TypingBox = () => {
  const [typedInput, setTypedInput] = useState<string>("");
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [displayStart, setDisplayStart] = useState<number>(0);
  const [wordStatus, setWordStatus] = useState<
    ("correct" | "incorrect" | null)[]
  >([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(true);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [rawWords, setRawWords] = useState<string[]>([]);
  const [totalCorrectWords, setTotalCorrectWords] = useState<number>(0);
  const [isLineShifting, setIsLineShifting] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionsType>({
    capitalization: false,
    punctuation: false,
    numbers: false,
    symbols: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const { primaryColor } = useTheme();
  const { user } = useAuth();
  const optionsKey: string = Object.values(options).join("-");

  const loadInitialWords = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const words = await loadWords();
      const shuffled = [...words];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!];
      }
      const mutated = mutateWords(shuffled, options);
      const selected = mutated.slice(0, 5000);
      setRawWords(shuffled);
      setAllWords(selected);
      setWordStatus(new Array(5000).fill(null));
      setTypedHistory(new Array(5000).fill(""));
      setActiveWordIndex(0);
      setTypedInput("");
      setTotalCorrectWords(0);
      setIsLoading(false);
      setDisplayStart(0);
    } catch (err) {
      console.error("Error loading words:", err);
    }
  };

  useEffect((): void => {
    loadInitialWords();
  }, []);

  useEffect((): void => {
    if (rawWords.length === 0 || isSessionActive) return;

    const start: number = Math.floor(Math.random() * (rawWords.length - 5000));
    const chunk: string[] = rawWords.slice(start, start + 5000);
    const mutated: string[] = mutateWords(chunk, options);
    const selected: string[] = mutated.slice(0, 5000);

    setAllWords(selected);
    setTypedInput("");
    setTypedHistory([]);
    setActiveWordIndex(0);
    setWordStatus(new Array(5000).fill(null));
    setTypedHistory(new Array(5000).fill(""));
    setDisplayStart(0);
  }, [options]);

  useEffect((): void => {
    if (allWords.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [allWords]);

  useEffect((): void | (() => void) => {
    const calculateAndShiftLines = () => {
      if (wordRefs.current.length === 0 || !wordRefs.current[0]) return;

      const lines: number[][] = [];
      let currentLine: number[] = [];
      let prevTop: number | null = null;

      wordRefs.current.forEach((el, idx) => {
        if (!el) return;
        const top = el.offsetTop;
        if (prevTop !== null && top > prevTop + 5) {
          lines.push(currentLine);
          currentLine = [];
        }
        currentLine.push(idx);
        prevTop = top;
      });
      if (currentLine.length > 0) lines.push(currentLine);

      const activeRelative = activeWordIndex - displayStart;
      if (activeRelative < 0 || activeRelative >= wordRefs.current.length)
        return;

      const activeLineIdx = lines.findIndex((line) =>
        line.includes(activeRelative)
      );

      if (activeLineIdx > 0) {
        let wordsToShift = 0;
        for (let i = 0; i < activeLineIdx; i++) {
          wordsToShift += lines[i]?.length || 0;
        }
        setIsLineShifting(true);
        setTimeout(() => {
          setDisplayStart((prev) => prev + wordsToShift);
          setIsLineShifting(false);
        }, 150);
      }
    };

    const timer = setTimeout(calculateAndShiftLines, 0);
    return () => clearTimeout(timer);
  }, [activeWordIndex, displayStart, optionsKey]);

  const getVisibleWords = (): string[] => {
    return allWords.slice(displayStart, displayStart + VISIBLE_WORD_COUNT);
  };

  const calculateResults = () => {
    const totalTypedChars = typedHistory.filter(Boolean).join("").length;
    const accuracy = (
      (totalCorrectWords / (totalCorrectWords + skippedCount)) *
      100
    ).toFixed(2);
    const wpm = Math.round((totalTypedChars / 5 / selectedTime) * 60);

    return {
      wpm,
      accuracy: parseFloat(accuracy),
      correct_words: totalCorrectWords,
      total_typed_chars: totalTypedChars,
      duration_seconds: selectedTime,
    };
  };

  const saveResults = async () => {
    if (!user) return;

    const stats = calculateResults();
    if (!stats) {
      console.error("No stats calculated, skipping save");
      return;
    }

    const newData = {
      user_id: user.id,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      correct_words: stats.correct_words,
      total_typed_chars: stats.total_typed_chars,
      duration_seconds: stats.duration_seconds,
    };

    try {
      const { data: existingResult, error: fetchError } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing result:", fetchError);
        return;
      }

      if (!existingResult) {
        const { error: insertError } = await supabase
          .from("results")
          .insert([newData]);

        if (insertError) {
          console.error("Error inserting first result:", insertError);
        } else {
          console.log("First result saved successfully");
        }
      } else {
        const isBetter =
          stats.wpm > existingResult.wpm ||
          (stats.wpm === existingResult.wpm &&
            stats.accuracy > existingResult.accuracy);

        if (isBetter) {
          const { error: updateError } = await supabase
            .from("results")
            .update(newData)
            .eq("user_id", user.id);

          if (updateError) {
            console.error("Error updating result:", updateError);
          } else {
            console.log("Better result updated successfully");
          }
        } else {
          console.log(
            "New result is not better than existing best - skipping save"
          );
        }
      }
    } catch (err) {
      console.error("Unexpected error during saveResults:", err);
    }
  };

  useEffect(() => {
    if (!isSessionActive) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          setIsSessionActive(false);
          setIsInputFocused(false);
          saveResults();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isSessionActive]);

  useEffect((): void => {
    setTimeLeft(selectedTime);
  }, [selectedTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let value: string = e.target.value;
    setTypedInput(value);

    if (!isSessionActive && timeLeft > 0) {
      setIsSessionActive(true);
    }

    if (value.endsWith(" ")) {
      const trimmed: string = value.trim();
      evaluateWord(trimmed);
      setTypedInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace") {
      if (typedInput.length > 0) {
        return;
      }

      const prevIndex: number = activeWordIndex - 1;

      if (prevIndex >= 0 && wordStatus[prevIndex] === "correct") {
        e.preventDefault();
        return;
      }

      if (prevIndex >= 0) {
        e.preventDefault();
        setActiveWordIndex(prevIndex);
        setTypedInput(typedHistory[prevIndex] || "");

        const updatedStatus: ("correct" | "incorrect" | null)[] = [
          ...wordStatus,
        ];
        for (let i = prevIndex + 1; i < updatedStatus.length; i++) {
          updatedStatus[i] = null;
        }
        setWordStatus(updatedStatus);
      }
    }
  };

  const evaluateWord = (input: string): void => {
    const currentWord = allWords[activeWordIndex];
    const isCorrect = input === currentWord;

    if (!isCorrect && input === "") {
      if (skippedCount >= 0) {
        return;
      }
      setSkippedCount(skippedCount + 1);
    }

    if (isCorrect) {
      setSkippedCount(0);
      setTotalCorrectWords((prev) => prev + 1);
    }

    const updatedStatus: ("correct" | "incorrect" | null)[] = [...wordStatus];
    updatedStatus[activeWordIndex] = isCorrect ? "correct" : "incorrect";
    setWordStatus(updatedStatus);

    const updatedTypedHistory: string[] = [...typedHistory];
    updatedTypedHistory[activeWordIndex] = input;
    setTypedHistory(updatedTypedHistory);

    setActiveWordIndex((prevIndex: number) => prevIndex + 1);
  };

  const resetWithNewWords = (): void => {
    const maxStart = Math.max(0, allWords.length - VISIBLE_WORD_COUNT);
    const newStart = Math.floor(Math.random() * maxStart);
    setDisplayStart(newStart);
    setActiveWordIndex(newStart);
    setTypedInput("");
    setTypedHistory(new Array(5000).fill(""));
    setWordStatus(new Array(5000).fill(null));
    setSkippedCount(0);
    setIsSessionActive(false);
    setIsInputFocused(true);
    setTimeLeft(selectedTime);
  };

  const getWordClass = (index: number): string => {
    if (index === activeWordIndex && isInputFocused)
      return `border-b ${colorClasses[primaryColor]?.border}`;
    if (wordStatus[index] === "correct") return "text-white";
    if (wordStatus[index] === "incorrect") {
      return "border-b border-red-400";
    }
    return "text-gray-600";
  };

  const getCharClass = (char: string, typedChar: string): string => {
    if (!typedChar) return "text-gray-600";
    if (char === typedChar) return "text-white";
    return "text-red-400";
  };

  const getInputForWord = (index: number): string => {
    return index === activeWordIndex ? typedInput : typedHistory[index] || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div
          className={`w-10 h-10 border-4 ${colorClasses[primaryColor]?.border} border-t-transparent rounded-full animate-spin`}
        ></div>
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
              <NavBar />

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
                      setOptions={(
                        newOptions: React.SetStateAction<typeof options>
                      ) => {
                        if (!isSessionActive) setOptions(newOptions);
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          {isSessionActive && (
            <div className="absolute -top-8 left-0 text-gray-300 flex items-center gap-2 text-base sm:text-lg">
              <MdAccessTime
                className={`text-xl ${colorClasses[primaryColor]?.text}`}
              />
              <span
                className={`font-semibold tracking-wide ${
                  timeLeft <= 10
                    ? "text-red-400 animate-pulse"
                    : colorClasses[primaryColor]?.text
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          )}

          <div
            className="relative h-[170px] overflow-hidden text-[1.6rem] sm:text-[2rem] leading-[2.6rem] tracking-wide font-medium text-gray-600 cursor-text outline-none pt-2 rounded-md"
            onClick={(): void => inputRef.current?.focus()}
          >
            <div
              key={`typing-box-${optionsKey}`}
              className={`flex flex-wrap gap-x-3 gap-y-4 animate-line-shift ${
                isLineShifting ? "line-shifting" : ""
              }`}
            >
              {getVisibleWords().map((word, index) => {
                const globalIndex = displayStart + index;
                const inputForWord = getInputForWord(globalIndex);

                return (
                  <span
                    ref={(el) => {
                      wordRefs.current[index] = el;
                    }}
                    key={globalIndex}
                    className={getWordClass(globalIndex)}
                  >
                    {word.split("").map((char, i) => {
                      const typedChar = inputForWord[i] || "";
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
        </div>

        <input
          type="text"
          className="absolute opacity-0 pointer-events-none"
          ref={inputRef}
          value={typedInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={(): void => setIsInputFocused(true)}
          onBlur={(): void => setIsInputFocused(false)}
        />

        {!isSessionActive && (
          <div className="flex justify-center">
            <button
              onClick={resetWithNewWords}
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
            onRestart={(): void => {
              resetWithNewWords();
              setWordStatus(new Array(5000).fill(null));
              setTypedHistory(new Array(5000).fill(""));
              setSkippedCount(0);
              setIsSessionActive(false);
              setIsInputFocused(true);
              setTimeLeft(selectedTime);
              setTypedInput("");
              setActiveWordIndex(0);
              setDisplayStart(0);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TypingBox;
