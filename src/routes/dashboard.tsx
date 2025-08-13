import React, { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext.js";
import { colorClasses } from "../utils/colorClasses.js";
import { useAuth } from "../context/AuthContext.js";
import supabase from "../utils/supabaseClient.js";

interface Result {
  id: string;
  created_at: string;
  wpm: number;
  accuracy: number;
  correct_words: number;
  total_typed_chars: number;
  duration_seconds: number;
}

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { primaryColor } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/signIn" });
      return;
    }

    const fetchData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      setUsername(profile?.username ?? "");

      const { data: resultsData } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setResults(resultsData ?? []);
      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-4 py-8 relative">
      <Link
        to="/"
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-800 transition-colors"
      >
        <X
          size={26}
          className="text-gray-400 hover:text-white transition-colors"
        />
      </Link>

      <h1
        className={`text-3xl md:text-4xl font-bold mb-10 text-center tracking-tight ${colorClasses[primaryColor]?.text}`}
      >
        {username ? `Welcome, ${username}` : "Dashboard"}
      </h1>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-6xl mb-12">
          <StatCard
            title="Best WPM"
            value={Math.max(...results.map((r) => r.wpm))}
            unit="WPM"
          />
          <StatCard
            title="Best Accuracy"
            value={Math.max(...results.map((r) => r.accuracy))}
            unit="%"
          />
        </div>
      )}

      <div className="w-full max-w-6xl bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800/70 text-gray-300 text-xs uppercase tracking-wider">
              <th className="px-5 py-4 text-left rounded-tl-lg">Date</th>
              <th className="px-5 py-4 text-left">WPM</th>
              <th className="px-5 py-4 text-left">Accuracy</th>
              <th className="px-5 py-4 text-left">Correct Words</th>
              <th className="px-5 py-4 text-left">Chars Typed</th>
              <th className="px-5 py-4 text-left rounded-tr-lg">Duration</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-6 text-center text-gray-400 italic"
                >
                  No results yet.
                </td>
              </tr>
            ) : (
              results.map((r, idx) => {
                const isBest = r.wpm === Math.max(...results.map((x) => x.wpm));
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-gray-900/50" : "bg-gray-900/30"
                    } hover:bg-gray-800/70 ${
                      isBest ? `ring-1 ring-${primaryColor}-500` : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-gray-300">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td
                      className={`px-5 py-4 font-semibold ${
                        isBest ? `text-${primaryColor}-400` : "text-white"
                      }`}
                    >
                      {r.wpm}
                    </td>
                    <td
                      className={`px-5 py-4 ${
                        r.accuracy > 90
                          ? `text-${primaryColor}-400`
                          : "text-gray-300"
                      }`}
                    >
                      {r.accuracy}%
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {r.correct_words}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {r.total_typed_chars}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {r.duration_seconds}s
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleLogout}
        className={`mt-10 flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-white 
    bg-gradient-to-r from-${primaryColor}-500 to-${primaryColor}-700 
    hover:scale-105 hover:shadow-lg hover:shadow-${primaryColor}-500/50 
    transition duration-200`}
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
}

const StatCard = ({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) => (
  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center shadow-md hover:shadow-xl hover:scale-[1.02] transition">
    <div className="text-sm text-gray-400 mb-1">{title}</div>
    <div className="text-4xl font-bold text-white">
      {value}
      <span className="text-lg text-gray-400 ml-1">{unit}</span>
    </div>
  </div>
);

export default Dashboard;
