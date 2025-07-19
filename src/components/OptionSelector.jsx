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
    <div className="flex justify-center flex-wrap gap-3 mt-5">
      {settings.map(({ key, label }) => {
        const isActive = options[key];

        return (
          <button
            key={key}
            onClick={() => toggleOption(key)}
            aria-pressed={isActive}
            className={`relative px-4 py-1.5 min-w-[60px] rounded-full text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-cyan-600 text-white shadow hover:bg-cyan-500'
                  : 'bg-[#1f1f29] text-cyan-300 hover:bg-[#2b2b39]'
              }
              focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
            `}
          >
            <span className="transition-transform duration-150 group-hover:scale-105">
              {label}
            </span>

            <span
              className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-[2px] w-[50%] rounded-full transition-all duration-150
                ${isActive ? 'bg-cyan-400 opacity-100' : 'opacity-0 group-hover:opacity-40'}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};

export default OptionSelector;
