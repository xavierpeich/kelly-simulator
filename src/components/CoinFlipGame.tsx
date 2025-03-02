import React, { useState, useEffect, ChangeEvent } from "react";

interface GameHistoryItem {
  flip: number;
  result: string;
  betAmount: number;
  bankrollAfter: number;
}

// Define all available strategies
type StrategyType =
  | "conservative"
  | "aggressive"
  | "adaptive"
  | "cautious"
  | "progressive"
  | "sbf"
  | "fibonacci"
  | "martingale"
  | "antimartingale";

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

  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === "strategy") {
      setBetAmount(calculateSuggestedBet());
    }
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
            <div
              className={`mb-6 p-3 sm:p-4 rounded-lg text-center ${
                flipResult === "win"
                  ? "bg-green-100 border border-green-200"
                  : "bg-red-100 border border-red-200"
              }`}
            >
              <div className="text-sm text-gray-700 mb-1">Last Flip</div>
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
            <div className="mb-5">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Betting Strategy
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => setSpecificStrategy("conservative")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "conservative"
                        ? "bg-green-600 text-white ring-2 ring-green-300"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "conservative"
                          ? "text-white"
                          : "text-green-500"
                      }`}
                    >
                      🔄
                    </span>
                    <span>Kelly (20%)</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("cautious")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "cautious"
                        ? "bg-yellow-600 text-white ring-2 ring-yellow-300"
                        : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "cautious"
                          ? "text-white"
                          : "text-yellow-500"
                      }`}
                    >
                      🛡️
                    </span>
                    <span>Cautious (10%)</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("adaptive")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "adaptive"
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "adaptive" ? "text-white" : "text-blue-500"
                      }`}
                    >
                      📊
                    </span>
                    <span>Adaptive</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("progressive")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "progressive"
                        ? "bg-purple-600 text-white ring-2 ring-purple-300"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "progressive"
                          ? "text-white"
                          : "text-purple-500"
                      }`}
                    >
                      📈
                    </span>
                    <span>Progressive</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("fibonacci")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "fibonacci"
                        ? "bg-amber-600 text-white ring-2 ring-amber-300"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "fibonacci"
                          ? "text-white"
                          : "text-amber-500"
                      }`}
                    >
                      🌀
                    </span>
                    <span>Fibonacci</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("martingale")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "martingale"
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "martingale"
                          ? "text-white"
                          : "text-emerald-500"
                      }`}
                    >
                      🎯
                    </span>
                    <span>Martingale</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("antimartingale")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "antimartingale"
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "antimartingale"
                          ? "text-white"
                          : "text-indigo-500"
                      }`}
                    >
                      🔄
                    </span>
                    <span>Anti-Martingale</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("sbf")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "sbf"
                        ? "bg-pink-600 text-white ring-2 ring-pink-300"
                        : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "sbf" ? "text-white" : "text-pink-500"
                      }`}
                    >
                      💸
                    </span>
                    <span>SBF (99%)</span>
                  </button>

                  <button
                    onClick={() => setSpecificStrategy("aggressive")}
                    className={`py-2 px-2 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center h-20 sm:h-24 transition-all strategy-button ${
                      strategy === "aggressive"
                        ? "bg-red-600 text-white ring-2 ring-red-300"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    <span
                      className={`text-xl sm:text-2xl mb-1 ${
                        strategy === "aggressive"
                          ? "text-white"
                          : "text-red-500"
                      }`}
                    >
                      🔥
                    </span>
                    <span>Aggressive</span>
                  </button>
                </div>

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
          {gameHistory.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold text-gray-800 mb-3">Game History</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Flip
                      </th>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bet
                      </th>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bankroll
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gameHistory.slice(-10).map((item) => (
                      <tr key={item.flip} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                          {item.flip}
                        </td>
                        <td
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                            item.result === "Win"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.result}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                          ${item.betAmount.toFixed(2)}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap">
                          ${item.bankrollAfter.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Strategy Information Section */}
          <div className="mt-6">
            <h2 className="font-bold text-gray-800 mb-3">
              Strategy Information
            </h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200">
              {/* Strategy Tabs - Horizontal scroll on small screens */}
              <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
                <button
                  onClick={() => setActiveInfoTab("general")}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium ${
                    activeInfoTab === "general"
                      ? "bg-white text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  General Info
                </button>
                {[
                  "conservative",
                  "cautious",
                  "adaptive",
                  "progressive",
                  "aggressive",
                  "fibonacci",
                  "martingale",
                  "antimartingale",
                  "sbf",
                ].map((strat) => (
                  <button
                    key={strat}
                    onClick={() => setActiveInfoTab(strat as StrategyType)}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium ${
                      activeInfoTab === strat
                        ? "bg-white text-blue-600 border-b-2 border-blue-500"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {strat.charAt(0).toUpperCase() + strat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-3 sm:p-4">
                {activeInfoTab === "general" && (
                  <div>
                    <h3 className="font-bold text-base mb-2">
                      Strategy Comparison
                    </h3>
                    <p className="mb-2 text-sm">
                      Different strategies balance risk vs. reward:
                    </p>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>
                        <span className="font-semibold text-purple-700">
                          Progressive:
                        </span>{" "}
                        Dynamic betting based on win streaks (10%-40%)
                      </li>
                      <li>
                        <span className="font-semibold text-green-700">
                          Kelly:
                        </span>{" "}
                        Mathematically optimal for long-term growth (20%)
                      </li>
                      <li>
                        <span className="font-semibold text-blue-700">
                          Adaptive:
                        </span>{" "}
                        Scales with bankroll size (20%-50%)
                      </li>
                      <li>
                        <span className="font-semibold text-yellow-700">
                          Cautious:
                        </span>{" "}
                        Ultra-conservative betting (10%)
                      </li>
                      <li>
                        <span className="font-semibold text-red-700">
                          Aggressive:
                        </span>{" "}
                        High-risk, high-reward betting (50%)
                      </li>
                    </ul>

                    <p className="mt-3 mb-2 text-sm italic">
                      Select a specific strategy tab above to learn more about
                      how each one works.
                    </p>
                  </div>
                )}

                {activeInfoTab === "progressive" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-purple-700">
                      Progressive Strategy
                    </h3>
                    <p className="mb-2 text-sm">
                      The progressive strategy is designed to capitalize on
                      winning streaks while protecting your bankroll during
                      losses.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <ol className="list-decimal pl-4 mb-2 text-sm">
                      <li>
                        <strong>Base Betting Rate:</strong> You start
                        conservatively by betting just 10% of your bankroll
                      </li>
                      <li>
                        <strong>Win Streak Bonus:</strong> For each consecutive
                        win, your bet increases by 5%
                        <ul className="list-disc pl-4 mt-1">
                          <li>0 wins: 10% of bankroll</li>
                          <li>1 win: 15% of bankroll</li>
                          <li>2 wins: 20% of bankroll</li>
                          <li>3 wins: 25% of bankroll, etc.</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Safety Cap:</strong> Maximum betting percentage
                        is capped at 40% to prevent excessive risk
                      </li>
                      <li>
                        <strong>Reset Mechanism:</strong> After any loss, the
                        betting percentage immediately drops back to the base
                        10%
                      </li>
                    </ol>

                    <h4 className="font-semibold text-sm mb-1">
                      Why It's Effective
                    </h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>
                        <strong>Capitalizes on winning streaks:</strong> Since
                        you have a 60% chance to win, winning streaks are more
                        common than in a fair game
                      </li>
                      <li>
                        <strong>Minimizes losses:</strong> When you lose, you
                        immediately drop back to small bets, protecting your
                        bankroll
                      </li>
                      <li>
                        <strong>Creates compound growth:</strong> When winning,
                        your bets get bigger both from the percentage increase
                        AND because they're calculated on a larger bankroll
                      </li>
                      <li>
                        <strong>Psychologically satisfying:</strong> Aligns with
                        the natural tendency to "press your advantage" when
                        things are going well
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">
                      Mathematical Advantage
                    </h4>
                    <p className="text-sm">
                      In a 60/40 game, you have a positive expected value (+20%
                      per bet). The progressive strategy magnifies this
                      advantage by betting more when you're on a winning streak
                      and less after losses.
                    </p>
                  </div>
                )}

                {activeInfoTab === "conservative" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-green-700">
                      Kelly Criterion (20%)
                    </h3>
                    <p className="mb-2 text-sm">
                      The Kelly criterion is a mathematical formula that
                      determines the optimal bet size to maximize the logarithm
                      of wealth over time.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <p className="mb-2 text-sm">
                      For a 60/40 game with even payoffs, the Kelly formula
                      calculates that the optimal bet is 20% of your bankroll:
                    </p>
                    <div className="bg-gray-100 p-2 rounded mb-2">
                      <p className="font-mono text-xs">
                        Kelly percentage = (edge / odds) = (0.6 * 2 - 1) / 1 =
                        0.2 = 20%
                      </p>
                    </div>

                    <h4 className="font-semibold text-sm mb-1">Advantages</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>Mathematically optimal for long-term growth</li>
                      <li>Balances growth with protection against ruin</li>
                      <li>Steady, consistent approach</li>
                      <li>Proven theoretical foundation</li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">Limitations</h4>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Assumes an infinite time horizon</li>
                      <li>
                        May be suboptimal for limited number of bets (like our
                        120 flips)
                      </li>
                      <li>
                        Doesn't capitalize on short-term variations in luck
                      </li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "adaptive" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-blue-700">
                      Adaptive Strategy
                    </h3>
                    <p className="mb-2 text-sm">
                      The adaptive strategy adjusts betting percentage based on
                      your current bankroll size, becoming more aggressive as
                      your bankroll grows.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>Bankroll ≤ $50: Bet 20% (Kelly)</li>
                      <li>Bankroll $51-$100: Bet 30%</li>
                      <li>Bankroll $101-$200: Bet 40%</li>
                      <li>Bankroll {">"} $200: Bet 50% (Aggressive)</li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">
                      Theory Behind It
                    </h4>
                    <p className="mb-2 text-sm">
                      This strategy is based on the concept of "risk budget" -
                      as your bankroll grows, you can afford to take more risk
                      without endangering your initial investment.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">Advantages</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>Protects initial capital with conservative bets</li>
                      <li>Accelerates growth once you have a safety cushion</li>
                      <li>Balances risk of ruin with maximizing returns</li>
                      <li>Well-suited for a fixed number of bets</li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "cautious" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-yellow-700">
                      Cautious Strategy (10%)
                    </h3>
                    <p className="mb-2 text-sm">
                      The cautious strategy uses a fixed 10% of your bankroll
                      for each bet, prioritizing safety above all else.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <p className="mb-2 text-sm">
                      You consistently bet 10% of your current bankroll on each
                      flip, regardless of previous outcomes or bankroll size.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">Advantages</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>Minimizes risk of bankruptcy</li>
                      <li>Very low volatility</li>
                      <li>Psychologically easy to follow</li>
                      <li>
                        Still captures compound growth with positive expected
                        value
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">Limitations</h4>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Suboptimal growth rate compared to Kelly</li>
                      <li>
                        Likely to underperform in limited betting scenarios
                      </li>
                      <li>
                        "Leaving money on the table" in a positive EV game
                      </li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "aggressive" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-red-700">
                      Aggressive Strategy (50%)
                    </h3>
                    <p className="mb-2 text-sm">
                      The aggressive strategy bets half your bankroll on each
                      flip, maximizing potential returns but accepting
                      significant risk.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <p className="mb-2 text-sm">
                      You bet 50% of your current bankroll on every flip,
                      regardless of previous outcomes or bankroll size.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">
                      Mathematical Impact
                    </h4>
                    <div className="bg-gray-100 p-2 rounded mb-2">
                      <p className="mb-1 text-xs">
                        Consequences of consecutive results:
                      </p>
                      <ul className="list-disc pl-4 text-xs">
                        <li>
                          Three consecutive losses would reduce your bankroll by
                          87.5% (50% to 25% to 12.5% of original)
                        </li>
                        <li>
                          Three consecutive wins would increase your bankroll by
                          337.5% (150% to 225% to 337.5% of original)
                        </li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-sm mb-1">
                      When It Works Well
                    </h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>When you get lucky early with winning streaks</li>
                      <li>
                        When you have a large number of bets remaining to
                        recover
                      </li>
                      <li>
                        When maximizing potential return is more important than
                        avoiding bankruptcy
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">
                      Why It Often Leads to Bankruptcy
                    </h4>
                    <p className="mb-2 text-sm">
                      Despite the positive expected value of the game, the
                      aggressive strategy often leads to bankruptcy because:
                    </p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>
                        Just a few consecutive losses can devastate your
                        bankroll
                      </li>
                      <li>
                        The asymmetric impact of percentage gains and losses
                        (losing 50% requires a 100% gain to recover)
                      </li>
                      <li>
                        Even with a 60% win probability, losing streaks of 3+
                        flips are common
                      </li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "fibonacci" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-amber-700">
                      Fibonacci Strategy
                    </h3>
                    <p className="mb-2 text-sm">
                      This strategy uses the famous Fibonacci sequence (1, 1, 2,
                      3, 5, 8, 13, 21...) to determine bet sizes, inspired by
                      patterns found throughout nature and mathematics.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <ol className="list-decimal pl-4 mb-2 text-sm">
                      <li>
                        <strong>Start at the beginning:</strong> You begin with
                        the smallest bet (position 0 in the sequence)
                      </li>
                      <li>
                        <strong>After a loss:</strong> Move one step forward in
                        the sequence, increasing your bet
                      </li>
                      <li>
                        <strong>After a win:</strong> Move two steps backward in
                        the sequence (but never below position 0)
                      </li>
                      <li>
                        <strong>Bet sizing:</strong> Each Fibonacci number is
                        multiplied by 2% of your bankroll to determine the
                        actual bet amount, capped at 50%
                      </li>
                    </ol>

                    <h4 className="font-semibold text-sm mb-1">
                      Mathematical Foundation
                    </h4>
                    <p className="mb-2 text-sm">
                      The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55,
                      89...) follows the rule that each number is the sum of the
                      two preceding ones. This pattern creates a natural
                      progression where each step is approximately 1.618 (the
                      Golden Ratio) times the previous.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">Advantages</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>
                        More conservative than Martingale but still responsive
                        to outcomes
                      </li>
                      <li>
                        Quicker recovery after losses due to the mathematical
                        progression
                      </li>
                      <li>Gradual increase of risk instead of doubling</li>
                      <li>
                        Natural scaling based on a mathematical sequence found
                        throughout nature
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">Limitations</h4>
                    <ul className="list-disc pl-4 text-sm">
                      <li>
                        Can still lead to large bets after a losing streak
                      </li>
                      <li>
                        Requires discipline and understanding of the sequence
                      </li>
                      <li>Less intuitive than other betting systems</li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "martingale" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-emerald-700">
                      Martingale Strategy
                    </h3>
                    <p className="mb-2 text-sm">
                      The Martingale is one of the oldest and most famous
                      betting strategies, dating back to 18th century France.
                      It's based on doubling your bet after each loss.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <ol className="list-decimal pl-4 mb-2 text-sm">
                      <li>
                        <strong>Start with a base bet:</strong> Begin with a
                        small bet (5% of your bankroll)
                      </li>
                      <li>
                        <strong>After a loss:</strong> Double your previous bet
                      </li>
                      <li>
                        <strong>After a win:</strong> Return to your original
                        base bet
                      </li>
                      <li>
                        <strong>Theory:</strong> Eventually, you'll win and
                        recover all previous losses plus a small profit
                      </li>
                    </ol>

                    <h4 className="font-semibold text-sm mb-1">
                      Mathematical Example
                    </h4>
                    <div className="bg-gray-100 p-2 rounded mb-2">
                      <p className="text-xs">Starting with $1 bets:</p>
                      <ul className="list-disc pl-4 text-xs">
                        <li>Bet $1, lose (-$1 total)</li>
                        <li>Bet $2, lose (-$3 total)</li>
                        <li>Bet $4, lose (-$7 total)</li>
                        <li>Bet $8, win (+$1 total)</li>
                        <li>Return to $1 bet</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-sm mb-1">Advantages</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>Simple to understand and execute</li>
                      <li>
                        Guarantees profit in theory (with unlimited bankroll)
                      </li>
                      <li>Works well in short sessions with few losses</li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">Limitations</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>
                        Requires exponentially larger bets after losing streaks
                      </li>
                      <li>Limited by bankroll size and bet limits</li>
                      <li>A few consecutive losses can be devastating</li>
                      <li>
                        Expected long-term return doesn't change (still 60/40)
                      </li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "antimartingale" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-indigo-700">
                      Anti-Martingale Strategy
                    </h3>
                    <p className="mb-2 text-sm">
                      Also known as the Reverse Martingale, this strategy is the
                      opposite of the classic Martingale - doubling bets after
                      wins rather than losses.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <ol className="list-decimal pl-4 mb-2 text-sm">
                      <li>
                        <strong>Start with a base bet:</strong> Begin with a
                        small bet (5% of your bankroll)
                      </li>
                      <li>
                        <strong>After a win:</strong> Double your previous bet
                        to capitalize on winning streaks
                      </li>
                      <li>
                        <strong>After a loss:</strong> Return to your original
                        base bet to minimize losses
                      </li>
                      <li>
                        <strong>Goal:</strong> Maximize profits during lucky
                        streaks while keeping losses small
                      </li>
                    </ol>

                    <h4 className="font-semibold text-sm mb-1">
                      Mathematical Example
                    </h4>
                    <div className="bg-gray-100 p-2 rounded mb-2">
                      <p className="text-xs">Starting with $1 bets:</p>
                      <ul className="list-disc pl-4 text-xs">
                        <li>Bet $1, win (+$1 total)</li>
                        <li>Bet $2, win (+$3 total)</li>
                        <li>Bet $4, win (+$7 total)</li>
                        <li>Bet $8, lose (-$1 from this bet, +$6 total)</li>
                        <li>Return to $1 bet</li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-sm mb-1">Advantages</h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>
                        "Riding the hot hand" - capitalizes on winning streaks
                      </li>
                      <li>Limits losses to a single base bet amount</li>
                      <li>
                        Works particularly well in a 60/40 game where winning
                        streaks are more common
                      </li>
                      <li>
                        Psychologically satisfying - betting more when winning
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">Limitations</h4>
                    <ul className="list-disc pl-4 text-sm">
                      <li>A single loss can wipe out significant gains</li>
                      <li>Less likely to recover from an early loss</li>
                      <li>Requires discipline to reset after losses</li>
                      <li>Can lead to rapid bankroll swings</li>
                    </ul>
                  </div>
                )}

                {activeInfoTab === "sbf" && (
                  <div>
                    <h3 className="font-bold text-base mb-2 text-pink-700">
                      Sam Bankman Fried Strategy (90%)
                    </h3>
                    <p className="mb-2 text-sm">
                      The SBF strategy bets 90% of your bankroll on each flip,
                      like betting customer funds on a coin toss. What could go
                      wrong?
                    </p>

                    <h4 className="font-semibold text-sm mb-1">How It Works</h4>
                    <p className="mb-2 text-sm">
                      You bet 90% of your current bankroll on every flip,
                      ignoring all risk management principles and rational
                      thought.
                    </p>

                    <h4 className="font-semibold text-sm mb-1">
                      Mathematical Impact
                    </h4>
                    <div className="bg-gray-100 p-2 rounded mb-2">
                      <p className="mb-1 text-xs">
                        Consequences of consecutive results:
                      </p>
                      <ul className="list-disc pl-4 text-xs">
                        <li>
                          Three consecutive losses would reduce your bankroll by
                          90% (90% to 0% of original)
                        </li>
                        <li>
                          Three consecutive wins would increase your bankroll by
                          90% (90% to 180% of original)
                        </li>
                      </ul>
                    </div>

                    <h4 className="font-semibold text-sm mb-1">
                      When It Works Well
                    </h4>
                    <ul className="list-disc pl-4 mb-2 text-sm">
                      <li>When you get lucky early with winning streaks</li>
                      <li>
                        When you have a large number of bets remaining to
                        recover
                      </li>
                      <li>
                        When maximizing potential return is more important than
                        avoiding bankruptcy
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm mb-1">
                      Why It Often Leads to Bankruptcy
                    </h4>
                    <p className="mb-2 text-sm">
                      Despite the positive expected value of the game, the SBF
                      strategy often leads to bankruptcy because:
                    </p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>
                        Just a few consecutive losses can devastate your
                        bankroll
                      </li>
                      <li>
                        The asymmetric impact of percentage gains and losses
                        (losing 90% requires a 100% gain to recover)
                      </li>
                      <li>
                        Even with a 60% win probability, losing streaks of 3+
                        flips are common
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinFlipGame;
