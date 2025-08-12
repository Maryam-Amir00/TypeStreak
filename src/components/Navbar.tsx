import React from "react";
import { useTheme } from "../context/ThemeContext.js";
import { colorClasses } from "../utils/colorClasses.js";
import { FaUserCircle } from "react-icons/fa";
import { MdEmojiEvents } from "react-icons/md";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext.js";

const NavBar = () => {
  const { primaryColor } = useTheme();
  const { isLoggedIn } = useAuth();

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-6 bg-transparent">
      <h1
        className={`text-4xl sm:text-5xl font-extrabold tracking-wide ${colorClasses[primaryColor]?.text} drop-shadow-lg`}
      >
        TypeStreak
        <span className="animate-blink">_</span>
      </h1>

      <div className="flex items-center gap-6 text-2xl sm:text-3xl">
      <Link to="/leaderboard" title="Leaderboard">
        <MdEmojiEvents
          className={`cursor-pointer hover:scale-110 transition-transform ${colorClasses[primaryColor]?.text}`}
          title="Leaderboard"
        />
        </Link>
        {isLoggedIn ? (
          <Link to="/dashboard" title="Dashboard">
            <FaUserCircle
              className={`cursor-pointer hover:scale-110 transition-transform ${colorClasses[primaryColor]?.text}`}
              title="Profile"
            />
          </Link>
        ) : (
          <Link to="/signIn" title="Login">
            <FaUserCircle
              className={`cursor-pointer hover:scale-110 transition-transform ${colorClasses[primaryColor]?.text}`}
              title="Login"
            />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
