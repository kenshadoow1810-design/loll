import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlayerSearch from './pages/PlayerSearch';
import PlayerDetail from './pages/PlayerDetail';
import News from './pages/News';
import Rankings from './pages/Rankings';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-950 text-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/players/search" element={<PlayerSearch />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/rankings" element={<Rankings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
