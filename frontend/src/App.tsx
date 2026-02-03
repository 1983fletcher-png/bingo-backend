import { Routes, Route } from 'react-router-dom';
import Host from './pages/Host';
import Play from './pages/Play';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<Host />} />
      <Route path="/join/:code" element={<Play />} />
    </Routes>
  );
}
