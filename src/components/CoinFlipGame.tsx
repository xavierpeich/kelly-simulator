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
  | "progressive";

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
  const [activeInfoTab, setActiveInfoTab] = useState<StrategyType | "general">(
    "general"
  );
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [showResetOptions, setShowResetOptions] = useState<boolean>(false);
  const [customFlips, setCustomFlips] = useState<number>(20);

  // Reset the game
  const resetGame = () => {
    setBankroll(25);
    setBetAmount(1);
    setFlipsRemaining(customFlips);
    setGameHistory([]);
    setFlipResult(null);
    setGameOver(false);
    setConsecutiveWins(0);
    setShowResetOptions(false);
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

    // Update consecutive wins count for progressive strategy
    if (win) {
      setConsecutiveWins(consecutiveWins + 1);
    } else {
      setConsecutiveWins(0);
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

    const runSimulation = () => {
      // Stop if conditions are met
      if (currentFlipsRemaining <= 0 || currentBankroll <= 0 || isGameOver) {
        setGameOver(true);
        return;
      }

      // 60% chance of winning
      const win = Math.random() < 0.6;

      // Update consecutive wins for progressive strategy
      if (win) {
        currentConsecutiveWins++;
      } else {
        currentConsecutiveWins = 0;
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
    }
  };

  return (
    <div className="max-w-[100%] mx-auto">
      <div className="bg-white rounded-xl shadow-md p-3 mb-3">
        <h1 className="text-xl font-bold mb-3">60/40 Coin Flip Game</h1>

        <div className="flex justify-between mb-4">
          <div className="text-sm">
            <div className="font-bold text-green-700">
              ${bankroll.toFixed(2)}
            </div>
            <div>Bankroll</div>
          </div>
          <div className="text-sm">
            <div className="font-bold">{flipsRemaining}</div>
            <div>Flips Left</div>
          </div>
        </div>

        {flipResult && (
          <div
            className={`mb-4 p-2 text-center rounded ${
              flipResult === "win"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Last flip: {flipResult === "win" ? "WIN!" : "LOSS"}
            {strategy === "progressive" &&
              flipResult === "win" &&
              consecutiveWins > 1 && (
                <div className="text-xs mt-1">
                  Win streak: {consecutiveWins}
                </div>
              )}
          </div>
        )}

        {/* Game Mode Tabs */}
        <div className="flex w-full border-b border-gray-200 mb-3">
          <button
            onClick={() => changeGameMode("manual")}
            className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
              gameMode === "manual"
                ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            disabled={gameOver}
          >
            Manual Betting
          </button>
          <button
            onClick={() => changeGameMode("strategy")}
            className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
              gameMode === "strategy"
                ? "bg-purple-100 text-purple-700 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            disabled={gameOver}
          >
            Strategy Auto-Play
          </button>
        </div>

        {/* Manual Mode Content */}
        {gameMode === "manual" && (
          <div className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bet Amount
              </label>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  max={bankroll}
                  value={betAmount}
                  onChange={handleBetChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  disabled={gameOver}
                />
              </div>
            </div>

            <button
              onClick={flipCoin}
              disabled={gameOver || bankroll <= 0 || flipsRemaining <= 0}
              className="w-full bg-blue-600 text-white py-1 px-3 text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Flip Coin (60/40)
            </button>
          </div>
        )}

        {/* Strategy Mode Content */}
        {gameMode === "strategy" && (
          <div className="mb-4">
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Betting Strategy
              </div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                <button
                  onClick={() => setSpecificStrategy("conservative")}
                  className={`py-1 px-2 rounded-md text-xs ${
                    strategy === "conservative"
                      ? "bg-green-100 text-green-800 border-2 border-green-500 font-bold"
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}
                >
                  Kelly (20%)
                </button>

                <button
                  onClick={() => setSpecificStrategy("cautious")}
                  className={`py-1 px-2 rounded-md text-xs ${
                    strategy === "cautious"
                      ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-500 font-bold"
                      : "bg-yellow-50 text-yellow-600 border border-yellow-200"
                  }`}
                >
                  Cautious (10%)
                </button>

                <button
                  onClick={() => setSpecificStrategy("adaptive")}
                  className={`py-1 px-2 rounded-md text-xs ${
                    strategy === "adaptive"
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-500 font-bold"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}
                >
                  Adaptive (20%-50%)
                </button>

                <button
                  onClick={() => setSpecificStrategy("progressive")}
                  className={`py-1 px-2 rounded-md text-xs ${
                    strategy === "progressive"
                      ? "bg-purple-100 text-purple-800 border-2 border-purple-500 font-bold"
                      : "bg-purple-50 text-purple-600 border border-purple-200"
                  }`}
                >
                  Progressive
                </button>

                <button
                  onClick={() => setSpecificStrategy("aggressive")}
                  className={`py-1 px-2 rounded-md col-span-2 text-xs ${
                    strategy === "aggressive"
                      ? "bg-red-100 text-red-800 border-2 border-red-500 font-bold"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  Aggressive (50%)
                </button>
              </div>

              <div className="bg-gray-50 p-2 rounded-md mb-3">
                <div className="text-xs text-gray-500">
                  <span className="font-bold">Selected Strategy:</span>
                  <span
                    className={`${getStrategyColorClasses()} px-1 py-0.5 rounded ml-1 text-xs`}
                  >
                    {getStrategyDescription()}
                  </span>
                </div>
                {strategy === "adaptive" && (
                  <div className="text-xs text-gray-600 mt-1">
                    Adapts betting percentage based on bankroll size
                  </div>
                )}
                {strategy === "progressive" && (
                  <div className="text-xs text-gray-600 mt-1">
                    Increases bet size with each consecutive win, resets after
                    loss
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={autoPlay}
              disabled={gameOver || bankroll <= 0 || flipsRemaining <= 0}
              className="w-full bg-purple-600 text-white py-1 px-3 text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              Auto Play with {getStrategyDescription()}
            </button>
          </div>
        )}

        {showResetOptions ? (
          <div className="mb-3 p-2 bg-gray-50 rounded-md">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Number of Flips
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={customFlips}
                onChange={handleCustomFlipsChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetGame}
                className="flex-1 bg-blue-600 text-white py-1 px-3 text-xs rounded-md hover:bg-blue-700"
              >
                Reset with {customFlips} Flips
              </button>
              <button
                onClick={() => setShowResetOptions(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-1 px-3 text-xs rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setShowResetOptions(true)}
              className="flex-1 max-w-xs bg-gray-200 text-gray-800 py-1 px-3 text-sm rounded-md hover:bg-gray-300"
            >
              Reset Game
            </button>
          </div>
        )}

        {gameOver && (
          <div className="mb-3 p-2 text-center rounded bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm">
            Game Over! Final bankroll: ${bankroll.toFixed(2)}
            {bankroll <= 0 && " - You ran out of money!"}
            {flipsRemaining <= 0 && bankroll > 0 && " - You ran out of flips."}
          </div>
        )}

        {gameHistory.length > 0 && (
          <div className="mt-3">
            <h2 className="font-bold text-sm mb-1">Last 5 Flips</h2>
            <div className="overflow-hidden rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 py-1 text-left text-xs font-medium text-gray-500">
                      Flip
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-medium text-gray-500">
                      Result
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-medium text-gray-500">
                      Bet
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-medium text-gray-500">
                      Bankroll
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gameHistory.slice(-5).map((item) => (
                    <tr key={item.flip}>
                      <td className="px-1 py-1 text-xs">{item.flip}</td>
                      <td
                        className={`px-1 py-1 text-xs ${
                          item.result === "Win"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.result}
                      </td>
                      <td className="px-1 py-1 text-xs">
                        ${item.betAmount.toFixed(2)}
                      </td>
                      <td className="px-1 py-1 text-xs">
                        ${item.bankrollAfter.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Information Section - Below Main Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-3 border-b">
          <h2 className="text-lg font-bold">Betting Strategies Guide</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b">
          <button
            onClick={() => setActiveInfoTab("general")}
            className={`px-2 py-2 text-xs font-medium ${
              activeInfoTab === "general"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveInfoTab("progressive")}
            className={`px-2 py-2 text-xs font-medium ${
              activeInfoTab === "progressive"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Progressive
          </button>
          <button
            onClick={() => setActiveInfoTab("conservative")}
            className={`px-2 py-2 text-xs font-medium ${
              activeInfoTab === "conservative"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Kelly
          </button>
          <button
            onClick={() => setActiveInfoTab("adaptive")}
            className={`px-2 py-2 text-xs font-medium ${
              activeInfoTab === "adaptive"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Adaptive
          </button>
          <button
            onClick={() => setActiveInfoTab("cautious")}
            className={`px-2 py-2 text-xs font-medium ${
              activeInfoTab === "cautious"
                ? "text-yellow-600 border-b-2 border-yellow-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cautious
          </button>
          <button
            onClick={() => setActiveInfoTab("aggressive")}
            className={`px-2 py-2 text-xs font-medium ${
              activeInfoTab === "aggressive"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Aggressive
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3">
          {activeInfoTab === "general" && (
            <div>
              <h3 className="font-bold text-base mb-2">About This Game</h3>
              <p className="mb-2 text-sm">
                This is a 60/40 coin flip game, meaning you have a 60% chance to
                win each flip. The game demonstrates how different betting
                strategies perform with a positive expected value.
              </p>

              <h3 className="font-bold text-base mb-2">Game Parameters</h3>
              <ul className="list-disc pl-4 mb-2 text-sm">
                <li>Starting bankroll: $25</li>
                <li>Default flips: 20 (customizable when resetting)</li>
                <li>Win probability: 60%</li>
              </ul>

              <h3 className="font-bold text-base mb-2">Betting Modes</h3>
              <ul className="list-disc pl-4 mb-2 text-sm">
                <li>
                  <span className="font-semibold">Manual Betting:</span> You
                  decide how much to bet on each flip
                </li>
                <li>
                  <span className="font-semibold">Strategy Betting:</span> Bet
                  amount is automatically calculated based on the selected
                  strategy
                </li>
              </ul>

              <h3 className="font-bold text-base mb-2">Strategy Comparison</h3>
              <p className="mb-2 text-sm">
                Different strategies balance risk vs. reward:
              </p>
              <ul className="list-disc pl-5">
                <li>
                  <span className="font-semibold text-purple-700">
                    Progressive:
                  </span>{" "}
                  Dynamic betting based on win streaks (10%-40%)
                </li>
                <li>
                  <span className="font-semibold text-green-700">Kelly:</span>{" "}
                  Mathematically optimal for long-term growth (20%)
                </li>
                <li>
                  <span className="font-semibold text-blue-700">Adaptive:</span>{" "}
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
            </div>
          )}

          {activeInfoTab === "progressive" && (
            <div>
              <h3 className="font-bold text-base mb-2 text-purple-700">
                Progressive Strategy
              </h3>
              <p className="mb-2 text-sm">
                The progressive strategy is designed to capitalize on winning
                streaks while protecting your bankroll during losses.
              </p>

              <h4 className="font-semibold text-sm mb-1">How It Works</h4>
              <ol className="list-decimal pl-4 mb-2 text-sm">
                <li>
                  <strong>Base Betting Rate:</strong> You start conservatively
                  by betting just 10% of your bankroll
                </li>
                <li>
                  <strong>Win Streak Bonus:</strong> For each consecutive win,
                  your bet increases by 5%
                  <ul className="list-disc pl-4 mt-1">
                    <li>0 wins: 10% of bankroll</li>
                    <li>1 win: 15% of bankroll</li>
                    <li>2 wins: 20% of bankroll</li>
                    <li>3 wins: 25% of bankroll, etc.</li>
                  </ul>
                </li>
                <li>
                  <strong>Safety Cap:</strong> Maximum betting percentage is
                  capped at 40% to prevent excessive risk
                </li>
                <li>
                  <strong>Reset Mechanism:</strong> After any loss, the betting
                  percentage immediately drops back to the base 10%
                </li>
              </ol>

              <h4 className="font-semibold text-sm mb-1">Why It's Effective</h4>
              <ul className="list-disc pl-4 mb-2 text-sm">
                <li>
                  <strong>Capitalizes on winning streaks:</strong> Since you
                  have a 60% chance to win, winning streaks are more common than
                  in a fair game
                </li>
                <li>
                  <strong>Minimizes losses:</strong> When you lose, you
                  immediately drop back to small bets, protecting your bankroll
                </li>
                <li>
                  <strong>Creates compound growth:</strong> When winning, your
                  bets get bigger both from the percentage increase AND because
                  they're calculated on a larger bankroll
                </li>
                <li>
                  <strong>Psychologically satisfying:</strong> Aligns with the
                  natural tendency to "press your advantage" when things are
                  going well
                </li>
              </ul>

              <h4 className="font-semibold text-sm mb-1">
                Mathematical Advantage
              </h4>
              <p className="text-sm">
                In a 60/40 game, you have a positive expected value (+20% per
                bet). The progressive strategy magnifies this advantage by
                betting more when you're on a winning streak and less after
                losses.
              </p>
            </div>
          )}

          {activeInfoTab === "conservative" && (
            <div>
              <h3 className="font-bold text-base mb-2 text-green-700">
                Kelly Criterion (20%)
              </h3>
              <p className="mb-2 text-sm">
                The Kelly criterion is a mathematical formula that determines
                the optimal bet size to maximize the logarithm of wealth over
                time.
              </p>

              <h4 className="font-semibold text-sm mb-1">How It Works</h4>
              <p className="mb-2 text-sm">
                For a 60/40 game with even payoffs, the Kelly formula calculates
                that the optimal bet is 20% of your bankroll:
              </p>
              <div className="bg-gray-100 p-2 rounded mb-2">
                <p className="font-mono text-xs">
                  Kelly percentage = (edge / odds) = (0.6 * 2 - 1) / 1 = 0.2 =
                  20%
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
                  May be suboptimal for limited number of bets (like our 120
                  flips)
                </li>
                <li>Doesn't capitalize on short-term variations in luck</li>
              </ul>
            </div>
          )}

          {activeInfoTab === "adaptive" && (
            <div>
              <h3 className="font-bold text-base mb-2 text-blue-700">
                Adaptive Strategy
              </h3>
              <p className="mb-2 text-sm">
                The adaptive strategy adjusts betting percentage based on your
                current bankroll size, becoming more aggressive as your bankroll
                grows.
              </p>

              <h4 className="font-semibold text-sm mb-1">How It Works</h4>
              <ul className="list-disc pl-4 mb-2 text-sm">
                <li>Bankroll ≤ $50: Bet 20% (Kelly)</li>
                <li>Bankroll $51-$100: Bet 30%</li>
                <li>Bankroll $101-$200: Bet 40%</li>
                <li>Bankroll {">"} $200: Bet 50% (Aggressive)</li>
              </ul>

              <h4 className="font-semibold text-sm mb-1">Theory Behind It</h4>
              <p className="mb-2 text-sm">
                This strategy is based on the concept of "risk budget" - as your
                bankroll grows, you can afford to take more risk without
                endangering your initial investment.
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
                The cautious strategy uses a fixed 10% of your bankroll for each
                bet, prioritizing safety above all else.
              </p>

              <h4 className="font-semibold text-sm mb-1">How It Works</h4>
              <p className="mb-2 text-sm">
                You consistently bet 10% of your current bankroll on each flip,
                regardless of previous outcomes or bankroll size.
              </p>

              <h4 className="font-semibold text-sm mb-1">Advantages</h4>
              <ul className="list-disc pl-4 mb-2 text-sm">
                <li>Minimizes risk of bankruptcy</li>
                <li>Very low volatility</li>
                <li>Psychologically easy to follow</li>
                <li>
                  Still captures compound growth with positive expected value
                </li>
              </ul>

              <h4 className="font-semibold text-sm mb-1">Limitations</h4>
              <ul className="list-disc pl-4 text-sm">
                <li>Suboptimal growth rate compared to Kelly</li>
                <li>Likely to underperform in limited betting scenarios</li>
                <li>"Leaving money on the table" in a positive EV game</li>
              </ul>
            </div>
          )}

          {activeInfoTab === "aggressive" && (
            <div>
              <h3 className="font-bold text-base mb-2 text-red-700">
                Aggressive Strategy (50%)
              </h3>
              <p className="mb-2 text-sm">
                The aggressive strategy bets half your bankroll on each flip,
                maximizing potential returns but accepting significant risk.
              </p>

              <h4 className="font-semibold text-sm mb-1">How It Works</h4>
              <p className="mb-2 text-sm">
                You bet 50% of your current bankroll on every flip, regardless
                of previous outcomes or bankroll size.
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
                    Three consecutive losses would reduce your bankroll by 87.5%
                    (50% to 25% to 12.5% of original)
                  </li>
                  <li>
                    Three consecutive wins would increase your bankroll by
                    337.5% (150% to 225% to 337.5% of original)
                  </li>
                </ul>
              </div>

              <h4 className="font-semibold text-sm mb-1">When It Works Well</h4>
              <ul className="list-disc pl-4 mb-2 text-sm">
                <li>When you get lucky early with winning streaks</li>
                <li>
                  When you have a large number of bets remaining to recover
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
                Despite the positive expected value of the game, the aggressive
                strategy often leads to bankruptcy because:
              </p>
              <ul className="list-disc pl-4 text-sm">
                <li>
                  Just a few consecutive losses can devastate your bankroll
                </li>
                <li>
                  The asymmetric impact of percentage gains and losses (losing
                  50% requires a 100% gain to recover)
                </li>
                <li>
                  Even with a 60% win probability, losing streaks of 3+ flips
                  are common
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinFlipGame;
