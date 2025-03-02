import React from "react";

export interface GameHistoryItem {
  flip: number;
  result: string;
  betAmount: number;
  bankrollAfter: number;
}

interface GameHistoryProps {
  gameHistory: GameHistoryItem[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ gameHistory }) => {
  if (gameHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="font-bold text-gray-800 mb-3">Game History</h2>
      <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 text-left">
                  Flip
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 text-left">
                  Result
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 text-left">
                  Bet Amount
                </th>
                <th className="px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 text-left">
                  Bankroll
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gameHistory.map((item) => (
                <tr
                  key={item.flip}
                  className={`${
                    item.result === "Win" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap">
                    {item.flip}
                  </td>
                  <td
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                      item.result === "Win" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.result}
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap">
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
    </div>
  );
};

export default GameHistory;
