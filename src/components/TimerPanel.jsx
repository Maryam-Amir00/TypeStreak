import React from "react";


const TimerPanel = ({ selectedTime, setSelectedTime, timeLeft, isSessionActive }) => {
  const timeOptions = [20, 30, 45, 60, 90, 120];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base gap-4 mb-6">

      <div className="flex gap-5 flex-wrap justify-center font-mono">
        {timeOptions.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            disabled={isSessionActive}
            className={`
              transition-all duration-300 ease-out
              text-lg sm:text-xl
              ${
                selectedTime === time
                  ? "text-cyan-400 font-bold scale-110 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                  : "text-gray-500 hover:text-cyan-300 hover:scale-105"
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
