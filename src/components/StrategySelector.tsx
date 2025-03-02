import React from "react";
import { StrategyType } from "./StrategyDescription";

interface StrategySelectorProps {
  strategy: StrategyType;
  setSpecificStrategy: (strategy: StrategyType) => void;
  gameOver: boolean;
}

interface StrategyButtonConfig {
  type: StrategyType;
  name: string;
  emoji: string;
  baseClass: string;
  activeClass: string;
  emojiClass: string;
}

const StrategySelector: React.FC<StrategySelectorProps> = ({
  strategy,
  setSpecificStrategy,
  gameOver,
}) => {
  const strategyConfigs: StrategyButtonConfig[] = [
    {
      type: "conservative",
      name: "Kelly (20%)",
      emoji: "🔄",
      baseClass: "bg-green-50 text-green-700 hover:bg-green-100",
      activeClass: "bg-green-600 text-white ring-2 ring-green-300",
      emojiClass: "text-green-500",
    },
    {
      type: "cautious",
      name: "Cautious (10%)",
      emoji: "🛡️",
      baseClass: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      activeClass: "bg-yellow-600 text-white ring-2 ring-yellow-300",
      emojiClass: "text-yellow-500",
    },
    {
      type: "adaptive",
      name: "Adaptive",
      emoji: "📊",
      baseClass: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      activeClass: "bg-blue-600 text-white ring-2 ring-blue-300",
      emojiClass: "text-blue-500",
    },
    {
      type: "progressive",
      name: "Progressive",
      emoji: "📈",
      baseClass: "bg-purple-50 text-purple-700 hover:bg-purple-100",
      activeClass: "bg-purple-600 text-white ring-2 ring-purple-300",
      emojiClass: "text-purple-500",
    },
    {
      type: "fibonacci",
      name: "Fibonacci",
      emoji: "🌀",
      baseClass: "bg-amber-50 text-amber-700 hover:bg-amber-100",
      activeClass: "bg-amber-600 text-white ring-2 ring-amber-300",
      emojiClass: "text-amber-500",
    },
    {
      type: "martingale",
      name: "Martingale",
      emoji: "🎯",
      baseClass: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      activeClass: "bg-emerald-600 text-white ring-2 ring-emerald-300",
      emojiClass: "text-emerald-500",
    },
    {
      type: "antimartingale",
      name: "Anti-Martingale",
      emoji: "🔄",
      baseClass: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      activeClass: "bg-indigo-600 text-white ring-2 ring-indigo-300",
      emojiClass: "text-indigo-500",
    },
    {
      type: "sbf",
      name: "SBF (99%)",
      emoji: "💸",
      baseClass: "bg-pink-50 text-pink-700 hover:bg-pink-100",
      activeClass: "bg-pink-600 text-white ring-2 ring-pink-300",
      emojiClass: "text-pink-500",
    },
    {
      type: "aggressive",
      name: "Aggressive",
      emoji: "🔥",
      baseClass: "bg-red-50 text-red-700 hover:bg-red-100",
      activeClass: "bg-red-600 text-white ring-2 ring-red-300",
      emojiClass: "text-red-500",
    },
  ];

  return (
    <div>
      <div className="font-medium text-sm text-gray-700 mb-2">
        Betting Strategy
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 mb-4">
        {strategyConfigs.map((config) => (
          <button
            key={config.type}
            onClick={() => setSpecificStrategy(config.type)}
            disabled={gameOver}
            className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
              strategy === config.type ? config.activeClass : config.baseClass
            }`}
          >
            <span
              className={`text-xl sm:text-2xl mb-1 ${
                strategy === config.type ? "text-white" : config.emojiClass
              }`}
            >
              {config.emoji}
            </span>
            <span>{config.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StrategySelector;
