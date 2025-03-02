import CoinFlipGame from "./components/CoinFlipGame";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
            Kelly Simulator
          </h1>
          <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
            Test various betting strategies in a 60/40 coin flip game
          </p>
        </header>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden">
          <CoinFlipGame />
        </div>
      </div>
    </div>
  );
}

export default App;
