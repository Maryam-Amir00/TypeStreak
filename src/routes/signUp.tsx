import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { colorClasses } from '../utils/colorClasses.js';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Route = createFileRoute('/signUp')({
  component: RouteComponent,
})

function RouteComponent() {
  const { primaryColor } = useTheme();
  const { signUp } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }    

    setLoading(true);
    try {
      await signUp(email, password, username );
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err?.message || "Something went wrong during sign up.");
    }
    setLoading(false);
  };


  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-950 px-4">
    <Link
      to="/"
      className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-800 transition-colors"
    >
      <X size={26} className="text-gray-400 hover:text-white transition-colors" />
    </Link>
    <form
      onSubmit={handleSignUp}
      className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md border border-gray-800"
    >
      <h2
        className={`text-3xl font-bold mb-6 text-center ${colorClasses[primaryColor]?.text}`}
      >
        Create Account
      </h2>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={`w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${colorClasses[primaryColor]?.border}`}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${colorClasses[primaryColor]?.border}`}
        required
      />

      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${colorClasses[primaryColor]?.border}`}
          required
        />
        
      </div>

      <div className="mb-6">
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${colorClasses[primaryColor]?.border}`}
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Must be at least{" "}
          <span className="font-semibold text-white">6 characters</span> long.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-lg font-semibold ${colorClasses[primaryColor]?.bg} hover:opacity-90 transition`}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-gray-400 mt-4 text-center">
        Already have an account?{" "}
        <Link
          to="/signIn"
          className={`${colorClasses[primaryColor]?.text} underline hover:opacity-80`}
        >
          Login
        </Link>
      </p>
    </form>
  </div>
);
}
