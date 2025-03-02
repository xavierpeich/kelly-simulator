import React from "react";

// Define all available strategies (should match the main app)
export type StrategyType =
  | "conservative"
  | "aggressive"
  | "adaptive"
  | "cautious"
  | "progressive"
  | "sbf"
  | "fibonacci"
  | "martingale"
  | "antimartingale";

interface StrategyDescriptionProps {
  activeInfoTab: StrategyType | "general";
}

const StrategyDescription: React.FC<StrategyDescriptionProps> = ({
  activeInfoTab,
}) => {
  return (
    <div className="p-3 sm:p-4">
      {activeInfoTab === "general" && (
        <div>
          <h3 className="font-bold text-base mb-2">Strategy Comparison</h3>
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
              <span className="font-semibold text-green-700">Kelly:</span>{" "}
              Mathematically optimal for long-term growth (20%)
            </li>
            <li>
              <span className="font-semibold text-blue-700">Adaptive:</span>{" "}
              Scales with bankroll size (20%-50%)
            </li>
            <li>
              <span className="font-semibold text-yellow-700">Cautious:</span>{" "}
              Ultra-conservative betting (10%)
            </li>
            <li>
              <span className="font-semibold text-red-700">Aggressive:</span>{" "}
              High-risk, high-reward betting (50%)
            </li>
          </ul>

          <p className="mt-3 mb-2 text-sm italic">
            Select a specific strategy tab above to learn more about how each
            one works.
          </p>
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
              <strong>Base Betting Rate:</strong> You start conservatively by
              betting just 10% of your bankroll
            </li>
            <li>
              <strong>Win Streak Bonus:</strong> For each consecutive win, your
              bet increases by 5%
              <ul className="list-disc pl-4 mt-1">
                <li>0 wins: 10% of bankroll</li>
                <li>1 win: 15% of bankroll</li>
                <li>2 wins: 20% of bankroll</li>
                <li>3 wins: 25% of bankroll, etc.</li>
              </ul>
            </li>
            <li>
              <strong>Safety Cap:</strong> Maximum betting percentage is capped
              at 40% to prevent excessive risk
            </li>
            <li>
              <strong>Reset Mechanism:</strong> After any loss, the betting
              percentage immediately drops back to the base 10%
            </li>
          </ol>

          <h4 className="font-semibold text-sm mb-1">Why It's Effective</h4>
          <ul className="list-disc pl-4 mb-2 text-sm">
            <li>
              <strong>Capitalizes on winning streaks:</strong> Since you have a
              60% chance to win, winning streaks are more common than in a fair
              game
            </li>
            <li>
              <strong>Minimizes losses:</strong> When you lose, you immediately
              drop back to small bets, protecting your bankroll
            </li>
            <li>
              <strong>Creates compound growth:</strong> When winning, your bets
              get bigger both from the percentage increase AND because they're
              calculated on a larger bankroll
            </li>
            <li>
              <strong>Psychologically satisfying:</strong> Aligns with the
              natural tendency to "press your advantage" when things are going
              well
            </li>
          </ul>

          <h4 className="font-semibold text-sm mb-1">Mathematical Advantage</h4>
          <p className="text-sm">
            In a 60/40 game, you have a positive expected value (+20% per bet).
            The progressive strategy magnifies this advantage by betting more
            when you're on a winning streak and less after losses.
          </p>
        </div>
      )}

      {activeInfoTab === "conservative" && (
        <div>
          <h3 className="font-bold text-base mb-2 text-green-700">
            Kelly Criterion (20%)
          </h3>
          <p className="mb-2 text-sm">
            The Kelly criterion is a mathematical formula that determines the
            optimal bet size to maximize the logarithm of wealth over time.
          </p>

          <h4 className="font-semibold text-sm mb-1">How It Works</h4>
          <p className="mb-2 text-sm">
            For a 60/40 game with even payoffs, the Kelly formula calculates
            that the optimal bet is 20% of your bankroll:
          </p>
          <div className="bg-gray-100 p-2 rounded mb-2">
            <p className="font-mono text-xs">
              Kelly percentage = (edge / odds) = (0.6 * 2 - 1) / 1 = 0.2 = 20%
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
              May be suboptimal for limited number of bets (like our 120 flips)
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
            bankroll grows, you can afford to take more risk without endangering
            your initial investment.
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
            <li>Still captures compound growth with positive expected value</li>
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
            You bet 50% of your current bankroll on every flip, regardless of
            previous outcomes or bankroll size.
          </p>

          <h4 className="font-semibold text-sm mb-1">Mathematical Impact</h4>
          <div className="bg-gray-100 p-2 rounded mb-2">
            <p className="mb-1 text-xs">Consequences of consecutive results:</p>
            <ul className="list-disc pl-4 text-xs">
              <li>
                Three consecutive losses would reduce your bankroll by 87.5%
                (50% to 25% to 12.5% of original)
              </li>
              <li>
                Three consecutive wins would increase your bankroll by 337.5%
                (150% to 225% to 337.5% of original)
              </li>
            </ul>
          </div>

          <h4 className="font-semibold text-sm mb-1">When It Works Well</h4>
          <ul className="list-disc pl-4 mb-2 text-sm">
            <li>When you get lucky early with winning streaks</li>
            <li>When you have a large number of bets remaining to recover</li>
            <li>
              When maximizing potential return is more important than avoiding
              bankruptcy
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
            <li>Just a few consecutive losses can devastate your bankroll</li>
            <li>
              The asymmetric impact of percentage gains and losses (losing 50%
              requires a 100% gain to recover)
            </li>
            <li>
              Even with a 60% win probability, losing streaks of 3+ flips are
              common
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
            This strategy uses the famous Fibonacci sequence (1, 1, 2, 3, 5, 8,
            13, 21...) to determine bet sizes, inspired by patterns found
            throughout nature and mathematics.
          </p>

          <h4 className="font-semibold text-sm mb-1">How It Works</h4>
          <ol className="list-decimal pl-4 mb-2 text-sm">
            <li>
              <strong>Start at the beginning:</strong> You begin with the
              smallest bet (position 0 in the sequence)
            </li>
            <li>
              <strong>After a loss:</strong> Move one step forward in the
              sequence, increasing your bet
            </li>
            <li>
              <strong>After a win:</strong> Move two steps backward in the
              sequence (but never below position 0)
            </li>
            <li>
              <strong>Bet sizing:</strong> Each Fibonacci number is multiplied
              by 2% of your bankroll to determine the actual bet amount, capped
              at 50%
            </li>
          </ol>

          <h4 className="font-semibold text-sm mb-1">
            Mathematical Foundation
          </h4>
          <p className="mb-2 text-sm">
            The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...)
            follows the rule that each number is the sum of the two preceding
            ones. This pattern creates a natural progression where each step is
            approximately 1.618 (the Golden Ratio) times the previous.
          </p>

          <h4 className="font-semibold text-sm mb-1">Advantages</h4>
          <ul className="list-disc pl-4 mb-2 text-sm">
            <li>
              More conservative than Martingale but still responsive to outcomes
            </li>
            <li>
              Quicker recovery after losses due to the mathematical progression
            </li>
            <li>Gradual increase of risk instead of doubling</li>
            <li>
              Natural scaling based on a mathematical sequence found throughout
              nature
            </li>
          </ul>

          <h4 className="font-semibold text-sm mb-1">Limitations</h4>
          <ul className="list-disc pl-4 text-sm">
            <li>Can still lead to large bets after a losing streak</li>
            <li>Requires discipline and understanding of the sequence</li>
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
            The Martingale is one of the oldest and most famous betting
            strategies, dating back to 18th century France. It's based on
            doubling your bet after each loss.
          </p>

          <h4 className="font-semibold text-sm mb-1">How It Works</h4>
          <ol className="list-decimal pl-4 mb-2 text-sm">
            <li>
              <strong>Start with a base bet:</strong> Begin with a small bet (5%
              of your bankroll)
            </li>
            <li>
              <strong>After a loss:</strong> Double your previous bet
            </li>
            <li>
              <strong>After a win:</strong> Return to your original base bet
            </li>
            <li>
              <strong>Theory:</strong> Eventually, you'll win and recover all
              previous losses plus a small profit
            </li>
          </ol>

          <h4 className="font-semibold text-sm mb-1">Mathematical Example</h4>
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
            <li>Guarantees profit in theory (with unlimited bankroll)</li>
            <li>Works well in short sessions with few losses</li>
          </ul>

          <h4 className="font-semibold text-sm mb-1">Limitations</h4>
          <ul className="list-disc pl-4 mb-2 text-sm">
            <li>Requires exponentially larger bets after losing streaks</li>
            <li>Limited by bankroll size and bet limits</li>
            <li>A few consecutive losses can be devastating</li>
            <li>Expected long-term return doesn't change (still 60/40)</li>
          </ul>
        </div>
      )}

      {activeInfoTab === "antimartingale" && (
        <div>
          <h3 className="font-bold text-base mb-2 text-indigo-700">
            Anti-Martingale Strategy
          </h3>
          <p className="mb-2 text-sm">
            Also known as the Reverse Martingale, this strategy is the opposite
            of the classic Martingale - doubling bets after wins rather than
            losses.
          </p>

          <h4 className="font-semibold text-sm mb-1">How It Works</h4>
          <ol className="list-decimal pl-4 mb-2 text-sm">
            <li>
              <strong>Start with a base bet:</strong> Begin with a small bet (5%
              of your bankroll)
            </li>
            <li>
              <strong>After a win:</strong> Double your previous bet to
              capitalize on winning streaks
            </li>
            <li>
              <strong>After a loss:</strong> Return to your original base bet to
              minimize losses
            </li>
            <li>
              <strong>Goal:</strong> Maximize profits during lucky streaks while
              keeping losses small
            </li>
          </ol>

          <h4 className="font-semibold text-sm mb-1">Mathematical Example</h4>
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
            <li>"Riding the hot hand" - capitalizes on winning streaks</li>
            <li>Limits losses to a single base bet amount</li>
            <li>
              Works particularly well in a 60/40 game where winning streaks are
              more common
            </li>
            <li>Psychologically satisfying - betting more when winning</li>
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
            Sam Bankman Fried Strategy (99%)
          </h3>
          <p className="mb-2 text-sm">
            The SBF strategy bets 99% of your bankroll on each flip, like
            betting customer funds on a coin toss. What could go wrong?
          </p>

          <h4 className="font-semibold text-sm mb-1">How It Works</h4>
          <p className="mb-2 text-sm">
            You bet 99% of your current bankroll on every flip, ignoring all
            risk management principles and rational thought.
          </p>

          <h4 className="font-semibold text-sm mb-1">Mathematical Impact</h4>
          <div className="bg-gray-100 p-2 rounded mb-2">
            <p className="mb-1 text-xs">Consequences of consecutive results:</p>
            <ul className="list-disc pl-4 text-xs">
              <li>
                Three consecutive losses would reduce your bankroll by 99.99%
                (effectively to 0)
              </li>
              <li>
                Three consecutive wins would increase your bankroll by 994%
                (almost 10x your original bankroll)
              </li>
            </ul>
          </div>

          <h4 className="font-semibold text-sm mb-1">When It Works Well</h4>
          <ul className="list-disc pl-4 mb-2 text-sm">
            <li>When you get lucky early with winning streaks</li>
            <li>When you're running a crypto exchange with no oversight</li>
            <li>
              When you need enormous returns and are willing to risk everything
            </li>
          </ul>

          <h4 className="font-semibold text-sm mb-1">
            Why It Often Leads to Bankruptcy
          </h4>
          <p className="mb-2 text-sm">
            Despite the positive expected value of the game, the SBF strategy
            guarantees bankruptcy because:
          </p>
          <ul className="list-disc pl-4 text-sm">
            <li>
              Just a single loss decimates your bankroll (leaves you with 1%)
            </li>
            <li>
              Two consecutive losses leave you with 0.01% of your original
              bankroll
            </li>
            <li>
              The probability of never experiencing two consecutive losses in 20
              flips is astronomically small
            </li>
            <li>
              The strategy basically ensures you'll be filing bankruptcy
              paperwork and potentially facing criminal charges
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StrategyDescription;
