import React, { useState, useEffect, ChangeEvent } from "react";
import StrategyDescription, { StrategyType } from "./StrategyDescription";
import GameHistory, { GameHistoryItem } from "./GameHistory";
import StrategyTabs from "./StrategyTabs";
import StrategySelector from "./StrategySelector";
import GameModeTabs from "./GameModeTabs";

// Define game modes
type GameMode = "manual" | "strategy";

const CoinFlipGame: React.FC = () => {
  const [bankroll, setBankroll] = useState<number>(25);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [flipsRemaining, setFlipsRemaining] = useState<number>(20);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [flipResult, setFlipResult] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<StrategyType>("conservative");
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0); // For Martingale
  const [activeInfoTab, setActiveInfoTab] = useState<StrategyType | "general">(
    "general"
  );
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [showResetOptions, setShowResetOptions] = useState<boolean>(false);
  const [customFlips, setCustomFlips] = useState<number>(20);
  // Add state for tracking Fibonacci sequence position
  const [fibonacciPosition, setFibonacciPosition] = useState<number>(0);
  // Base bet amount for Martingale and Anti-Martingale
  const [baseBetAmount, setBaseBetAmount] = useState<number>(1);

  // Reset the game
  const resetGame = () => {
    setBankroll(25);
    setBetAmount(1);
    setFlipsRemaining(customFlips);
    setGameHistory([]);
    setFlipResult(null);
    setGameOver(false);
    setConsecutiveWins(0);
    setConsecutiveLosses(0);
    setShowResetOptions(false);
    setFibonacciPosition(0); // Reset Fibonacci position
    setBaseBetAmount(1); // Reset base bet amount
  };

  // Handle custom flips change
  const handleCustomFlipsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value <= 0) {
      setCustomFlips(1);
    } else {
      setCustomFlips(value);
    }
  };

  // Set specific strategy
  const setSpecificStrategy = (newStrategy: StrategyType) => {
    setStrategy(newStrategy);
  };

  // Calculate suggested bet based on strategy
  const calculateSuggestedBet = () => {
    let suggestedBet = 1;

    switch (strategy) {
      case "conservative":
        // Kelly criterion for 60/40 odds: (0.6*2-1)/1 = 0.2 or 20% of bankroll
        suggestedBet = Math.floor(bankroll * 0.2 * 100) / 100;
        break;

      case "aggressive":
        // Aggressive strategy: bet half the bankroll
        suggestedBet = Math.floor((bankroll / 2) * 100) / 100;
        break;

      case "sbf":
        // SBF strategy: bet 99% of the bankroll every time
        suggestedBet = Math.floor(bankroll * 0.99 * 100) / 100;
        break;

      case "adaptive":
        // Adaptive strategy: scales betting percentage based on bankroll size
        if (bankroll <= 50) {
          // Start with Kelly when bankroll is small
          suggestedBet = Math.floor(bankroll * 0.2 * 100) / 100;
        } else if (bankroll <= 100) {
          // Increase to 30% when bankroll grows
          suggestedBet = Math.floor(bankroll * 0.3 * 100) / 100;
        } else if (bankroll <= 200) {
          // Increase to 40% for medium bankroll
          suggestedBet = Math.floor(bankroll * 0.4 * 100) / 100;
        } else {
          // Full aggressive for large bankroll
          suggestedBet = Math.floor(bankroll * 0.5 * 100) / 100;
        }
        break;

      case "cautious":
        // Ultra-conservative approach: 10% of bankroll
        suggestedBet = Math.floor(bankroll * 0.1 * 100) / 100;
        break;

      case "progressive":
        // Progressive strategy: increase bet with consecutive wins, reset on loss
        const progressiveRate = 0.1 + consecutiveWins * 0.05;
        // Cap at 40% to avoid excessive risk
        const cappedRate = Math.min(progressiveRate, 0.4);
        suggestedBet = Math.floor(bankroll * cappedRate * 100) / 100;
        break;

      case "fibonacci":
        // Fibonacci strategy: bet according to the Fibonacci sequence
        // Get the Fibonacci number at the current position
        const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        // Use modulo to avoid index out of bounds, and ensure we don't go beyond practical bet sizes
        const fibNumber = fibSequence[Math.min(fibonacciPosition, 10)];
        // Use a percentage of bankroll based on the Fibonacci number (scaled down)
        const fibPercentage = Math.min(fibNumber * 0.02, 0.5); // Cap at 50% of bankroll
        suggestedBet = Math.floor(bankroll * fibPercentage * 100) / 100;
        break;

      case "martingale":
        // Martingale strategy: double bet after each loss, return to base after win
        // Start with 5% of bankroll as base bet
        if (consecutiveLosses === 0) {
          // Base bet is 5% of bankroll (first bet or after a win)
          const newBaseBet = Math.floor(bankroll * 0.05 * 100) / 100;
          setBaseBetAmount(Math.max(1, newBaseBet));
          suggestedBet = Math.max(1, newBaseBet);
        } else {
          // Double the previous bet after each loss
          suggestedBet = Math.pow(2, consecutiveLosses) * baseBetAmount;
        }
        break;

      case "antimartingale":
        // Anti-Martingale: double bet after each win, return to base after loss
        // Start with 5% of bankroll as base bet
        if (consecutiveWins === 0) {
          // Base bet is 5% of bankroll (first bet or after a loss)
          const newBaseBet = Math.floor(bankroll * 0.05 * 100) / 100;
          setBaseBetAmount(Math.max(1, newBaseBet));
          suggestedBet = Math.max(1, newBaseBet);
        } else {
          // Double the previous bet after each win
          suggestedBet = Math.pow(2, consecutiveWins) * baseBetAmount;
        }
        break;
    }

    // Ensure bet doesn't exceed bankroll
    return Math.max(1, Math.min(suggestedBet, bankroll));
  };

  // Auto-suggest bet amount based on selected strategy (only in strategy mode)
  useEffect(() => {
    if (gameMode === "strategy") {
      setBetAmount(calculateSuggestedBet());
    }
  }, [bankroll, strategy, consecutiveWins, gameMode]);

  // Adjust bet amount input (only for manual mode)
  const handleBetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      setBetAmount(1);
    } else if (value > bankroll) {
      setBetAmount(bankroll);
    } else {
      setBetAmount(value);
    }
  };

  // Perform coin flip (for manual mode)
  const flipCoin = () => {
    if (flipsRemaining <= 0 || bankroll <= 0 || gameOver) {
      setGameOver(true);
      return;
    }

    // 60% chance of winning
    const win = Math.random() < 0.6;

    // Update consecutive wins/losses for strategies
    if (win) {
      setConsecutiveWins(consecutiveWins + 1);
      setConsecutiveLosses(0); // Reset consecutive losses
      // For Fibonacci: move two steps back after a win (but not below 0)
      if (strategy === "fibonacci") {
        setFibonacciPosition(Math.max(0, fibonacciPosition - 2));
      }
    } else {
      setConsecutiveWins(0); // Reset consecutive wins
      setConsecutiveLosses(consecutiveLosses + 1); // Increment consecutive losses
      // For Fibonacci: move one step up the sequence after a loss
      if (strategy === "fibonacci") {
        setFibonacciPosition(fibonacciPosition + 1);
      }
    }

    // Calculate new bankroll
    const newBankroll = win ? bankroll + betAmount : bankroll - betAmount;

    // Update game state
    setBankroll(newBankroll);
    setFlipsRemaining(flipsRemaining - 1);
    setFlipResult(win ? "win" : "loss");

    // Add to history
    setGameHistory([
      ...gameHistory,
      {
        flip: gameHistory.length + 1,
        result: win ? "Win" : "Loss",
        betAmount,
        bankrollAfter: newBankroll,
      },
    ]);

    // Check if lost everything or ran out of flips
    if (newBankroll <= 0) {
      setBankroll(0);
      setGameOver(true);
    } else if (flipsRemaining <= 1) {
      setGameOver(true);
    }
  };

  // Auto play (for strategy mode)
  const autoPlay = () => {
    // Create a copy of the current state
    let currentBankroll = bankroll;
    let currentFlipsRemaining = flipsRemaining;
    let currentGameHistory = [...gameHistory];
    let isGameOver = false;
    let newFlipResult = flipResult;
    let currentConsecutiveWins = consecutiveWins;
    let currentConsecutiveLosses = consecutiveLosses;
    let currentFibonacciPosition = fibonacciPosition;
    let currentBaseBetAmount = baseBetAmount;

    const runSimulation = () => {
      // Stop if conditions are met
      if (currentFlipsRemaining <= 0 || currentBankroll <= 0 || isGameOver) {
        setGameOver(true);
        return;
      }

      // 60% chance of winning
      const win = Math.random() < 0.6;

      // Update consecutive wins/losses for strategies
      if (win) {
        currentConsecutiveWins++;
        currentConsecutiveLosses = 0; // Reset consecutive losses
        // For Fibonacci: move two steps back after a win (but not below 0)
        if (strategy === "fibonacci") {
          currentFibonacciPosition = Math.max(0, currentFibonacciPosition - 2);
        }
      } else {
        currentConsecutiveWins = 0; // Reset consecutive wins
        currentConsecutiveLosses++; // Increment consecutive losses
        // For Fibonacci: move one step up the sequence after a loss
        if (strategy === "fibonacci") {
          currentFibonacciPosition++;
        }
      }

      // Calculate current bet based on strategy
      let currentBetAmount = 1;

      switch (strategy) {
        case "conservative":
          // Kelly bet (20% of bankroll)
          currentBetAmount = Math.floor(currentBankroll * 0.2 * 100) / 100;
          break;

        case "aggressive":
          // Aggressive: half the bankroll
          currentBetAmount = Math.floor(currentBankroll * 0.5 * 100) / 100;
          break;

        case "adaptive":
          // Adaptive strategy based on bankroll size
          if (currentBankroll <= 50) {
            currentBetAmount = Math.floor(currentBankroll * 0.2 * 100) / 100;
          } else if (currentBankroll <= 100) {
            currentBetAmount = Math.floor(currentBankroll * 0.3 * 100) / 100;
          } else if (currentBankroll <= 200) {
            currentBetAmount = Math.floor(currentBankroll * 0.4 * 100) / 100;
          } else {
            currentBetAmount = Math.floor(currentBankroll * 0.5 * 100) / 100;
          }
          break;

        case "cautious":
          // Ultra-conservative: 10% of bankroll
          currentBetAmount = Math.floor(currentBankroll * 0.1 * 100) / 100;
          break;

        case "sbf":
          // SBF strategy: bet 99% of the bankroll every time
          currentBetAmount = Math.floor(currentBankroll * 0.99 * 100) / 100;
          break;

        case "progressive":
          // Progressive: increase with consecutive wins
          const progressiveRate = 0.1 + currentConsecutiveWins * 0.05;
          const cappedRate = Math.min(progressiveRate, 0.4);
          currentBetAmount =
            Math.floor(currentBankroll * cappedRate * 100) / 100;
          break;

        case "fibonacci":
          // Fibonacci strategy: bet according to the Fibonacci sequence
          const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
          // Use modulo to avoid index out of bounds
          const fibNumber = fibSequence[Math.min(currentFibonacciPosition, 10)];
          // Use a percentage of bankroll based on the Fibonacci number (scaled down)
          const fibPercentage = Math.min(fibNumber * 0.02, 0.5); // Cap at 50% of bankroll
          currentBetAmount =
            Math.floor(currentBankroll * fibPercentage * 100) / 100;
          break;

        case "martingale":
          // Martingale strategy: double bet after each loss, return to base after win
          if (currentConsecutiveLosses === 0) {
            // Base bet is 5% of bankroll (first bet or after a win)
            currentBaseBetAmount =
              Math.floor(currentBankroll * 0.05 * 100) / 100;
            currentBaseBetAmount = Math.max(1, currentBaseBetAmount);
            currentBetAmount = currentBaseBetAmount;
          } else {
            // Double the previous bet after each loss
            currentBetAmount =
              Math.pow(2, currentConsecutiveLosses) * currentBaseBetAmount;
          }
          break;

        case "antimartingale":
          // Anti-Martingale: double bet after each win, return to base after loss
          if (currentConsecutiveWins === 0) {
            // Base bet is 5% of bankroll (first bet or after a loss)
            currentBaseBetAmount =
              Math.floor(currentBankroll * 0.05 * 100) / 100;
            currentBaseBetAmount = Math.max(1, currentBaseBetAmount);
            currentBetAmount = currentBaseBetAmount;
          } else {
            // Double the previous bet after each win
            currentBetAmount =
              Math.pow(2, currentConsecutiveWins) * currentBaseBetAmount;
          }
          break;
      }

      // Apply constraints and ensure minimum bet of 1
      currentBetAmount = Math.min(currentBetAmount, currentBankroll);
      currentBetAmount = Math.max(1, currentBetAmount);

      // Calculate new bankroll
      const newBankroll = win
        ? currentBankroll + currentBetAmount
        : currentBankroll - currentBetAmount;

      // Update local state
      currentBankroll = newBankroll;
      currentFlipsRemaining--;
      newFlipResult = win ? "win" : "loss";

      // Add to history
      currentGameHistory = [
        ...currentGameHistory,
        {
          flip: currentGameHistory.length + 1,
          result: win ? "Win" : "Loss",
          betAmount: currentBetAmount,
          bankrollAfter: newBankroll,
        },
      ];

      // Check if lost everything
      if (newBankroll <= 0) {
        currentBankroll = 0;
        isGameOver = true;
      }

      // Update React state periodically
      setBankroll(currentBankroll);
      setFlipsRemaining(currentFlipsRemaining);
      setFlipResult(newFlipResult);
      setGameHistory(currentGameHistory);
      setConsecutiveWins(currentConsecutiveWins);
      setConsecutiveLosses(currentConsecutiveLosses);
      setFibonacciPosition(currentFibonacciPosition);
      setBaseBetAmount(currentBaseBetAmount);

      if (isGameOver || currentFlipsRemaining <= 0) {
        setGameOver(true);
      } else {
        // Continue simulation
        setTimeout(runSimulation, 50);
      }
    };

    // Start the simulation
    runSimulation();
  };

  // Get strategy description
  const getStrategyDescription = () => {
    switch (strategy) {
      case "conservative":
        return "Conservative (Kelly 20%)";
      case "aggressive":
        return "Aggressive (50% bets)";
      case "adaptive":
        return "Adaptive (20%-50% based on bankroll)";
      case "cautious":
        return "Cautious (10% bets)";
      case "progressive":
        return `Progressive (${
          10 + Math.min(consecutiveWins * 5, 30)
        }% + win streak bonus)`;
      case "sbf":
        return "SBF (99% of bankroll)";
      case "fibonacci":
        const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const fibNumber = fibSequence[Math.min(fibonacciPosition, 10)];
        const fibPercentage = Math.min(fibNumber * 0.02, 0.5);
        return `Fibonacci (${(fibPercentage * 100).toFixed(0)}%)`;
      case "martingale":
        if (consecutiveLosses === 0) {
          return "Martingale (Base: 5%)";
        }
        return `Martingale (${Math.pow(2, consecutiveLosses) * 5}%)`;
      case "antimartingale":
        if (consecutiveWins === 0) {
          return "Anti-Martingale (Base: 5%)";
        }
        return `Anti-Martingale (${Math.pow(2, consecutiveWins) * 5}%)`;
    }
  };

  // Get strategy color classes
  const getStrategyColorClasses = () => {
    switch (strategy) {
      case "conservative":
        return "bg-green-100 text-green-800 border border-green-300";
      case "aggressive":
        return "bg-red-100 text-red-800 border border-red-300";
      case "adaptive":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "cautious":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "progressive":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "sbf":
        return "bg-pink-100 text-pink-800 border border-pink-300";
      case "fibonacci":
        return "bg-amber-100 text-amber-800 border border-amber-300";
      case "martingale":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "antimartingale":
        return "bg-indigo-100 text-indigo-800 border border-indigo-300";
    }
  };

  // Component Return (UI)
  return (
    <div className="p-0">
      {/* Game Dashboard */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Game Controls */}
        <div className="w-full lg:w-7/12 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
          {/* Game Stats Bar */}
          <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="text-center px-2">
              <div className="text-xs text-gray-500 mb-1">Bankroll</div>
              <div
                className={`text-base sm:text-xl font-bold ${
                  bankroll > 25
                    ? "text-green-600"
                    : bankroll < 25
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                ${bankroll.toFixed(2)}
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-xs text-gray-500 mb-1">Current Bet</div>
              <div className="text-base sm:text-xl font-bold text-blue-600">
                ${betAmount.toFixed(2)}
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-xs text-gray-500 mb-1">Flips Left</div>
              <div className="text-base sm:text-xl font-bold text-purple-600">
                {flipsRemaining}
              </div>
            </div>
          </div>

          {/* Last Result */}
          {flipResult && (
            <div className="flex justify-center items-center mb-4">
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  flipResult === "win" ? "text-green-600" : "text-red-600"
                }`}
              >
                {flipResult === "win" ? "WIN" : "LOSS"}
              </div>
            </div>
          )}

          {/* Game Mode Tabs */}
          <GameModeTabs
            gameMode={gameMode}
            changeGameMode={setGameMode}
            gameOver={gameOver}
          />

          {/* Manual Mode Content */}
          {gameMode === "manual" && (
            <div className="mb-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount
                </label>
                <div className="flex">
                  <input
                    type="range"
                    min="1"
                    max={bankroll}
                    step="0.01"
                    value={betAmount}
                    onChange={handleBetChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={gameOver}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">$1</span>
                  <span className="text-xs font-medium text-blue-600">
                    ${betAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ${bankroll.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={flipCoin}
                disabled={gameOver || bankroll <= 0 || flipsRemaining <= 0}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-base sm:text-lg"
              >
                Flip Coin (60/40)
              </button>
            </div>
          )}

          {/* Strategy Mode Content */}
          {gameMode === "strategy" && (
            <div className="mb-6">
              <StrategySelector
                strategy={strategy}
                setSpecificStrategy={setSpecificStrategy}
                gameOver={gameOver}
              />

              <div className="bg-gray-50 p-3 rounded-lg mb-4 shadow-sm">
                <div className="text-sm text-gray-700 font-medium mb-1">
                  Selected Strategy:
                </div>
                <div className="flex items-center">
                  <span
                    className={`${getStrategyColorClasses()} px-2 py-1 rounded text-sm font-medium`}
                  >
                    {getStrategyDescription()}
                  </span>
                </div>
                {strategy === "adaptive" && (
                  <div className="text-xs text-gray-600 mt-2">
                    Adapts betting percentage based on bankroll size
                  </div>
                )}
                {strategy === "progressive" && (
                  <div className="text-xs text-gray-600 mt-2">
                    Increases bet size with each consecutive win, resets after
                    loss
                  </div>
                )}
              </div>

              <button
                onClick={autoPlay}
                disabled={gameOver || bankroll <= 0 || flipsRemaining <= 0}
                className="w-full bg-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium text-base sm:text-lg"
              >
                Auto Play with {getStrategyDescription()}
              </button>
            </div>
          )}

          {/* Game Over Message */}
          {gameOver && (
            <div className="mb-4 p-3 sm:p-4 text-center rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300">
              <div className="text-base sm:text-lg font-bold mb-2">
                Game Over!
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1">
                ${bankroll.toFixed(2)}
              </div>
              <div className="text-sm">
                {bankroll <= 0 && "You ran out of money!"}
                {flipsRemaining <= 0 && bankroll > 0 && "You ran out of flips."}
              </div>
            </div>
          )}

          {/* Reset Game */}
          {showResetOptions ? (
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm">
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Flips
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customFlips}
                  onChange={handleCustomFlipsChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 sm:px-4 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset with {customFlips} Flips
                </button>
                <button
                  onClick={() => setShowResetOptions(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 sm:px-4 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 sm:mt-6">
              <button
                onClick={() => setShowResetOptions(true)}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Game
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Game History & Information */}
        <div className="w-full lg:w-5/12 p-4 sm:p-6">
          {/* Game History Section */}
          <GameHistory gameHistory={gameHistory} />

          {/* Strategy Information Section */}
          <div className="mt-6">
            <h2 className="font-bold text-gray-800 mb-3">
              Strategy Information
            </h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200">
              {/* Strategy Tabs - Horizontal scroll on small screens */}
              <StrategyTabs
                activeInfoTab={activeInfoTab}
                setActiveInfoTab={setActiveInfoTab}
              />

              <div className="p-3 sm:p-4">
                {/* Strategy Information Content */}
                <StrategyDescription activeInfoTab={activeInfoTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipGame;
