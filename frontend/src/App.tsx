import { Routes, Route } from 'react-router-dom';
import Host from './pages/Host';
import Play from './pages/Play';
import Home from './pages/Home';
import Display from './pages/Display';
import JoinEntry from './pages/JoinEntry';
import Create from './pages/Create';
import Learn from './pages/Learn';
import LearnCard from './pages/LearnCard';
import ActivityCalendar from './pages/ActivityCalendar';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<Host />} />
      <Route path="/display/:code" element={<Display />} />
      <Route path="/join" element={<JoinEntry />} />
      <Route path="/join/:code" element={<Play />} />
      <Route path="/create" element={<Create />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/:id" element={<LearnCard />} />
      <Route path="/calendar" element={<ActivityCalendar />} />
    </Routes>
  );
}
