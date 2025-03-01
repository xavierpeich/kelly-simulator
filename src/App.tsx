import CoinFlipGame from "./components/CoinFlipGame";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center py-4">Kelly Simulator</h1>
        <CoinFlipGame />
      </div>
    </div>
  );
}

export default App;
