import React from "react";
import TypingBox from "./components/TypingBox";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="hidden">
        <span className="text-cyan-400 bg-cyan-600 border-cyan-500"></span>
        <span className="text-teal-400 bg-teal-600 border-teal-500"></span>
        <span className="text-emerald-400 bg-emerald-600 border-emerald-500"></span>
        <span className="text-purple-400 bg-purple-600 border-purple-500"></span>
        <span className="text-orange-400 bg-orange-600 border-orange-500"></span>
        <span className="text-pink-400 bg-pink-600 border-pink-500"></span>
        <span className="text-blue-400 bg-blue-600 border-blue-500"></span>
        <span className="text-rose-400 bg-rose-600 border-rose-500"></span>
        <span className="text-yellow-400 bg-yellow-600 border-yellow-500"></span>
      </div>

      <main className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4]">
        <TypingBox />
      </main>
    </ThemeProvider>
  );
}

export default App;
