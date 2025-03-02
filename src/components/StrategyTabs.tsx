import React from "react";
import { StrategyType } from "./StrategyDescription";

interface StrategyTabsProps {
  activeInfoTab: StrategyType | "general";
  setActiveInfoTab: (tab: StrategyType | "general") => void;
}

const StrategyTabs: React.FC<StrategyTabsProps> = ({
  activeInfoTab,
  setActiveInfoTab,
}) => {
  const strategies: (StrategyType | "general")[] = [
    "general",
    "conservative",
    "cautious",
    "adaptive",
    "progressive",
    "aggressive",
    "fibonacci",
    "martingale",
    "antimartingale",
    "sbf",
  ];

  return (
    <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
      {strategies.map((strat) => (
        <button
          key={strat}
          onClick={() => setActiveInfoTab(strat)}
          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium ${
            activeInfoTab === strat
              ? "bg-white text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          {strat === "general"
            ? "General Info"
            : strat.charAt(0).toUpperCase() + strat.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default StrategyTabs;
