import React from "react";

type GameMode = "manual" | "strategy";

interface GameModeTabsProps {
  gameMode: GameMode;
  changeGameMode: (mode: GameMode) => void;
  gameOver: boolean;
}

const GameModeTabs: React.FC<GameModeTabsProps> = ({
  gameMode,
  changeGameMode,
  gameOver,
}) => {
  return (
    <div className="flex w-full border border-gray-200 rounded-md overflow-hidden mb-5">
      <button
        onClick={() => changeGameMode("manual")}
        className={`flex-1 py-2 sm:py-3 text-center font-medium transition-colors text-sm sm:text-base ${
          gameMode === "manual"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        disabled={gameOver}
      >
        Manual Betting
      </button>
      <button
        onClick={() => changeGameMode("strategy")}
        className={`flex-1 py-2 sm:py-3 text-center font-medium transition-colors text-sm sm:text-base ${
          gameMode === "strategy"
            ? "bg-purple-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        disabled={gameOver}
      >
        Strategy Auto-Play
      </button>
    </div>
  );
};

export default GameModeTabs;
