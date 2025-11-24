import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to game if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/game");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400 text-xl font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Game Title */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 text-blue-400 font-mono tracking-wider">
          {APP_TITLE}
        </h1>
        <p className="text-xl text-gray-400 font-mono">
          A tribute to the classic MMORPG Tibia
        </p>
      </div>

      {/* Login Box */}
      <div className="bg-gray-900 border-4 border-blue-600 rounded-lg p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400 font-mono mb-2">
            Welcome, Adventurer!
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            Sign in to start your journey
          </p>
        </div>

        {/* Game Features */}
        <div className="mb-6 space-y-2 text-sm font-mono text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Grid-based movement & combat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Monster hunting & loot system</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Equipment & skill tree progression</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Persistent online progress</span>
          </div>
        </div>

        {/* Login Button */}
        <a href={getLoginUrl()} className="block">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono text-lg py-6 border-2 border-blue-400 shadow-lg transition-all hover:scale-105"
          >
            🎮 Sign In to Play
          </Button>
        </a>

        <p className="text-center text-xs text-gray-500 font-mono mt-4">
          Your progress will be automatically saved
        </p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600 font-mono text-sm">
        <p>Use WASD or Arrow Keys to move • Click monsters to attack</p>
      </div>
    </div>
  );
}
