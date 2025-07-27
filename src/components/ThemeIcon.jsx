import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FaPalette } from "react-icons/fa";

const colors = [
  "cyan",
  "teal",
  "yellow",
  "purple",
  "pink",
  "blue",
  "rose",
  "emerald",
];

const ThemeIcon = () => {
  const { primaryColor, setPrimaryColor } = useTheme();
  const [open, setOpen] = useState(false);
  const tailwindColors = {
    cyan: "#22d3ee",
    teal: "#14b8a6",
    yellow: "#eab308",
    purple: "#a855f7",
    orange: "#f97316",
    pink: "#ec4899",
    blue: "#3b82f6",
    rose: "#fb7185",
    emerald: "#10b981",
  };

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={toggleDropdown}
        className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-gradient-to-br from-${primaryColor}-400 to-${primaryColor}-600 transition-transform duration-200 hover:scale-110 ring-1 ring-white/10`}
        title="Change Theme Color"
      >
        <FaPalette className="text-white text-xl animate-spin-slow" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-40 p-3 bg-[#1f2230] rounded-xl shadow-lg grid grid-cols-4 gap-3 border border-white/10">
          {colors.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: tailwindColors[color] }}
              className={`w-6 h-6 rounded-full hover:scale-110 transition-all ${
                primaryColor === color ? "ring-2 ring-white" : ""
              }`}
              onClick={() => {
                setPrimaryColor(color);
                setOpen(false);
              }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeIcon;
