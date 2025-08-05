import React from "react";
import { useTheme } from "../context/ThemeContext.js";
import { colorClasses } from "../utils/colorClasses.js";
import type { ColorStyle } from "../utils/colorClasses.js"; 


interface TimerPanelProps {
  selectedTime: number;
  setSelectedTime: React.Dispatch<React.SetStateAction<number>>;
  timeLeft: number;
  isSessionActive: boolean;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  selectedTime,
  setSelectedTime,
  timeLeft,
  isSessionActive,
}) => {
  const timeOptions: number[] = [20, 30, 45, 60, 90, 120];

  const { primaryColor } = useTheme();

  
  const color: ColorStyle = colorClasses[primaryColor] ?? colorClasses["cyan"] as ColorStyle;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base gap-4 mb-6">
      <div className="flex gap-5 flex-wrap justify-center font-mono">
        {timeOptions.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            disabled={isSessionActive}
            className={`
              transition-all duration-300 ease-out text-lg sm:text-xl
              ${
                selectedTime === time
                  ? `${color.text} font-bold scale-110 ${color.shadow}`
                  : `text-gray-500 hover:${color.text} hover:scale-105`
              }
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
          >
            {time}s
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimerPanel;
