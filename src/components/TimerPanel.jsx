import React from "react";
import { MdAccessTime } from "react-icons/md";

const TimerPanel = ({ selectedTime, setSelectedTime, timeLeft, isSessionActive }) => {
  const timeOptions = [20, 30, 45, 60, 90, 120];

  return (
    <div className="p-3 sm:p-4 rounded-md border border-cyan-800 bg-[#1e1e1e] shadow-md mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base text-cyan-400 gap-4">

        <div className="flex gap-4 flex-wrap justify-center">
          {timeOptions.map((time) => (
            <label
              key={time}
              className="flex items-center gap-1 cursor-pointer transition duration-150 hover:text-white focus-within:text-white"
            >
              <input
                type="radio"
                name="time"
                value={time}
                checked={selectedTime === time}
                onChange={() => setSelectedTime(time)}
                disabled={isSessionActive}
                className="accent-cyan-400 checked:ring-cyan-400"
              />
              {time}s
            </label>
          ))}
        </div>

        <div className="text-gray-300 flex items-center gap-1">
          <MdAccessTime className="text-xl text-cyan-400" />
          Time Left:{" "}
          <span className={`font-semibold ${timeLeft <= 10 ? "text-red-400" : ""}`}>
            {timeLeft}s
          </span>
        </div>

      </div>
    </div>
  );
};

export default TimerPanel;
