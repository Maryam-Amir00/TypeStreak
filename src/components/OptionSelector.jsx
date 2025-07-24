import React from 'react';

const OptionSelector = ({ options, setOptions }) => {
  const toggleOption = (key) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settings = [
    { key: 'capitalization', label: 'Aa' },
    { key: 'punctuation', label: '.,?!' },
    { key: 'numbers', label: '123' },
    { key: 'symbols', label: '@#$' },
  ];

  return (
    <div className="flex justify-center flex-wrap gap-3 mt-4">
      {settings.map(({ key, label }) => {
        const isActive = options[key];

        return (
          <button
            key={key}
            onClick={() => toggleOption(key)}
            aria-pressed={isActive}
            className={`
              relative px-4 py-2 min-w-[60px] rounded-full text-sm font-semibold tracking-wide
              transition-all duration-300 border
              ${
                isActive
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-400/30"
                  : "bg-[#1a1c24] text-cyan-300 border-[#2b2e3a] hover:bg-[#2b2f3f] hover:text-white"
              }
              focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
            `}
          >
            {label}
            {isActive && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-white rounded-full shadow-sm shadow-white/50 animate-ping" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OptionSelector;
