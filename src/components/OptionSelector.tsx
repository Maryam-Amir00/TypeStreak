import React from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { colorClasses } from '../utils/colorClasses.js';
import type { ThemeColor, ColorStyle } from '../utils/colorClasses.js';

export interface OptionsType {
  capitalization: boolean;
  punctuation: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface OptionSelectorProps {
  options: OptionsType;
  setOptions: React.Dispatch<React.SetStateAction<OptionsType>>;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ options, setOptions }) => {
  const toggleOption = (key: keyof OptionsType) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settings: { key: keyof OptionsType; label: string }[] = [
    { key: 'capitalization', label: 'Aa' },
    { key: 'punctuation', label: '.,?!' },
    { key: 'numbers', label: '123' },
    { key: 'symbols', label: '@#$' },
  ];

  const { primaryColor } = useTheme();

  const colors: ColorStyle = (colorClasses[primaryColor as ThemeColor] ?? colorClasses["cyan"]) as ColorStyle;

  return (
    <div className="flex justify-center flex-wrap gap-3 mt-4">
      {settings.map(({ key, label }) => {
        const isActive = options[key];

        return (
          <button
            key={key}
            onClick={() => toggleOption(key)}
            aria-pressed={isActive}
            title={key}
            className={`
              relative px-4 py-2 min-w-[60px] rounded-full text-sm font-semibold tracking-wide
              transition-all duration-300 border focus:outline-none
              ${
                isActive
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
