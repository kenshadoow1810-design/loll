import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/common/Navbar';
import { Home } from './pages/Home';
import { Players } from './pages/Players';
import { PlayerDetail } from './pages/PlayerDetail';
import { Compare } from './pages/Compare';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-300">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/players" element={<Players />} />
            <Route path="/player/:playerId/:league" element={<PlayerDetail />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
