import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X, Crown } from "lucide-react";
import supabase from "../utils/supabaseClient.js";
import { useTheme } from "../context/ThemeContext.js";
import { colorClasses } from "../utils/colorClasses.js";
import { useAuth } from "../context/AuthContext.js";

type LeaderboardRow = {
  user_id: string;
  wpm: number;
  accuracy: number;
  correct_words: number;
  total_typed_chars: number;
  duration_seconds: number;
  profiles: {
    username: string | null;
  }[];
};

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { primaryColor } = useTheme();
  const { user } = useAuth();

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr("");

      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .order("wpm", { ascending: false })
        .order("accuracy", { ascending: false });

      if (resultsError) {
        setErr(resultsError.message || "Failed to load results.");
        setRows([]);
        setLoading(false);
        return;
      }

      if (resultsData && resultsData.length > 0) {
        const userIds = [...new Set(resultsData.map((r) => r.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        const combinedData = resultsData.map((result) => ({
          ...result,
          profiles: profilesData
            ? profilesData.filter((p) => p.id === result.user_id)
            : [],
        }));

        console.log("Results data:", resultsData);
        console.log("Profiles data:", profilesData);
        console.log("Combined data:", combinedData);

        setRows(combinedData as LeaderboardRow[]);
      } else {
        setRows([]);
      }

      if (!active) return;

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white px-4 py-10">
      <Link
        to="/"
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-800 transition-colors"
      >
        <X
          size={26}
          className="text-gray-400 hover:text-white transition-colors"
        />
      </Link>

      <div className="max-w-6xl mx-auto mb-8">
        <h1
          className={`text-3xl md:text-4xl font-extrabold tracking-tight ${colorClasses[primaryColor]?.text}`}
        >
          Leaderboard
        </h1>
        <p className="text-gray-400 mt-2">
          Sorted by <span className="text-gray-200 font-medium">WPM</span>, then{" "}
          <span className="text-gray-200 font-medium">Accuracy</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {loading ? (
          <>
            <PodiumSkeleton />
            <PodiumSkeleton />
            <PodiumSkeleton />
          </>
        ) : (
          top3.map((r, i) => (
            <div
              key={r.user_id}
              className={`relative rounded-2xl p-5 bg-gray-900/80 border border-gray-800 shadow-lg overflow-hidden`}
            >
              <div className="absolute -right-8 -top-8 opacity-20">
                <Crown size={96} />
              </div>

              <div className="flex items-center justify-between">
                <div
                  className={
                    i === 0
                      ? "text-yellow-400"
                      : i === 1
                        ? "text-gray-300"
                        : "text-amber-600"
                  }
                >
                  #{i + 1}
                </div>
                <div className="text-sm text-gray-400">
                  {r.duration_seconds}s
                </div>
              </div>

              <div className="mt-3 text-xl font-semibold">
                {r.profiles[0]?.username || "Anonymous"}
                {r.user_id === user?.id && (
                  <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    You
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-end gap-6">
                <div>
                  <div className="text-3xl font-extrabold">{r.wpm}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">
                    WPM
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{r.accuracy}%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">
                    Accuracy
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="max-w-6xl mx-auto bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-800/70 text-gray-300 text-xs uppercase tracking-wider">
              <tr>
                <Th>Rank</Th>
                <Th>Username</Th>
                <Th>WPM</Th>
                <Th>Accuracy</Th>
                <Th>Duration</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : err ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-red-400"
                  >
                    {err}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-gray-400 italic"
                  >
                    No results yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const isYou = r.user_id === user?.id;
                  const rankColor =
                    idx === 0
                      ? "text-yellow-400 font-bold"
                      : idx === 1
                        ? "text-gray-300 font-semibold"
                        : idx === 2
                          ? "text-amber-600 font-semibold"
                          : "text-gray-400";

                  return (
                    <tr
                      key={r.user_id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? "bg-gray-900/50" : "bg-gray-900/30"
                      } hover:bg-gray-800/70 ${
                        isYou ? "ring-1 ring-cyan-500/60" : ""
                      }`}
                    >
                      <Td className={rankColor}>#{idx + 1}</Td>
                      <Td
                        className={
                          isYou
                            ? `${colorClasses[primaryColor]?.text} font-semibold`
                            : "text-gray-200"
                        }
                      >
                        {r.profiles[0]?.username || "Anonymous"}
                        {isYou && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            you
                          </span>
                        )}
                      </Td>
                      <Td className="font-semibold text-white">{r.wpm}</Td>
                      <Td className="text-gray-300">{r.accuracy}%</Td>
                      <Td className="text-gray-300">{r.duration_seconds}s</Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Th: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <th className={`px-5 py-4 text-left whitespace-nowrap ${className}`}>
    {children}
  </th>
);

const Td: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <td className={`px-5 py-4 whitespace-nowrap ${className}`}>{children}</td>
);

const SkeletonRow: React.FC = () => (
  <tr className="bg-gray-900/40 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 w-24 bg-gray-800 rounded" />
      </td>
    ))}
  </tr>
);

const PodiumSkeleton: React.FC = () => (
  <div className="rounded-2xl p-5 bg-gray-900/60 border border-gray-800 shadow-lg animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-10 bg-gray-800 rounded" />
      <div className="h-3 w-24 bg-gray-800 rounded" />
    </div>
    <div className="mt-3 h-5 w-40 bg-gray-800 rounded" />
    <div className="mt-4 flex items-end gap-6">
      <div className="h-8 w-16 bg-gray-800 rounded" />
      <div className="h-6 w-14 bg-gray-800 rounded" />
    </div>
  </div>
);
