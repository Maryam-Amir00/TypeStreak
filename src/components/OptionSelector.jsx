import React from 'react';

const OptionSelector = ({ options, setOptions }) => {
  const toggleOption = (key) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settings = [
    { key: 'capitalization', label: 'Capitalization' },
    { key: 'punctuation', label: 'Punctuation' },
    { key: 'numbers', label: 'Numbers' },
    { key: 'symbols', label: 'Symbols' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center">
      {settings.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => toggleOption(key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
            options[key]
              ? 'bg-cyan-600 text-white hover:bg-cyan-500'
              : 'bg-[#1e293b] text-gray-300 hover:bg-[#2d3b55]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default OptionSelector;
