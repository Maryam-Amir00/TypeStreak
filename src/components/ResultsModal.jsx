import React from 'react';
import ReactDOM from 'react-dom';

const ResultsModal = ({ wordStatus, selectedTime, onRestart }) => {
  const totalWords = wordStatus.filter((w) => w !== null).length;
  const correctWords = wordStatus.filter((w) => w === "correct").length;

  const accuracy = totalWords === 0 ? 0 : ((correctWords / totalWords) * 100).toFixed(1);
  const wpm = ((correctWords / selectedTime) * 60).toFixed(1);
  const targetAccuracy = 98;

  const getAccuracyColor = () =>
    accuracy >= targetAccuracy ? "text-green-400" : "text-cyan-400";

  const getSpeedColor = () =>
    wpm >= 40 ? "text-green-400" : "text-cyan-400";

  const modal = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className="bg-[#0f172a]/90 border border-cyan-400/20 text-white p-8 md:p-10 rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.45)] w-[90%] max-w-md text-center space-y-8 relative 
        transition duration-300 ease-out transform scale-95 opacity-0 animate-[fadeAndScaleIn_0.3s_ease-out_forwards]"
      >
        <button
          onClick={onRestart}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-cyan-400 tracking-tight drop-shadow-sm">
            Session Summary
          </h2>
          <p className="text-sm text-gray-400">Review your performance!</p>
        </div>

        <div className="flex justify-around items-center gap-6 pt-2">
          <div className="flex flex-col items-center">
            <span className={`text-5xl font-extrabold ${getAccuracyColor()} drop-shadow-md`}>
              {accuracy}%
            </span>
            <span className="text-gray-300 text-sm mt-1">Accuracy</span>
            <span className="text-xs text-gray-500">Target: {targetAccuracy}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-5xl font-extrabold ${getSpeedColor()} drop-shadow-md`}>
              {wpm} WPM
            </span>
            <span className="text-gray-300 text-sm mt-1">Speed</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-500 hover:shadow-cyan-400/40 hover:scale-[1.03] text-black py-3 rounded-xl font-semibold tracking-wide shadow-xl transition-all duration-200"
          >
            Try Again ↺
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById('modal-root'));
};

export default ResultsModal;
