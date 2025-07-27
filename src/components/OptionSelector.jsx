import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { colorClasses } from '../utils/colorClasses'; // adjust path as needed

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

  const { primaryColor } = useTheme();
  const colors = colorClasses[primaryColor] || colorClasses.cyan; // fallback if undefined

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
              transition-all duration-300 border focus:outline-none
              ${isActive
                ? `text-white ${colors.bg} ${colors.border} ${colors.shadow}`
                : `bg-[#1a1c24] ${colors.text} border-[#2b2e3a] hover:bg-[#2b2f3f] hover:text-white`
              }
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
