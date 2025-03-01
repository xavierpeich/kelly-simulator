# Kelly Simulator

A React application that simulates various betting strategies in a 60/40 coin flip game, including the Kelly Criterion and other popular approaches.

## About the Project

This simulator demonstrates how different betting strategies perform over time in a game with positive expected value. The game consists of a coin with a 60% chance of landing heads (win) and 40% chance of landing tails (loss).

## Features

- **Multiple Betting Strategies:**

  - Kelly Criterion (20% of bankroll)
  - Aggressive (50% of bankroll)
  - Adaptive (scales from 20% to 50% based on bankroll size)
  - Cautious (10% of bankroll)
  - Progressive (increases with win streaks, resets on loss)

- **Game Parameters:**

  - Starting bankroll: $25
  - Maximum flips: 120
  - Win probability: 60%

- **Detailed Information:**
  - Comprehensive guide to each betting strategy
  - Mathematical explanations
  - Strategy comparisons

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/xavierpeich/kelly-simulator.git
   ```
2. Install NPM packages
   ```
   npm install
   ```
3. Start the development server
   ```
   npm run dev
   ```

## Usage

The application allows you to:

- Choose a betting strategy
- Manually flip the coin
- Use auto-play to simulate many flips
- View detailed explanations of each strategy

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Vite

## License

Distributed under the MIT License.

## Contact

Xavier Peich - [@xavierpeich](https://github.com/xavierpeich)

Project Link: [https://github.com/xavierpeich/kelly-simulator](https://github.com/xavierpeich/kelly-simulator)
