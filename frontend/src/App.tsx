import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import Host from './pages/Host';
import Play from './pages/Play';
import Home from './pages/Home';
import Display from './pages/Display';
import JoinEntry from './pages/JoinEntry';
import Create from './pages/Create';
import CreativeStudio from './pages/CreativeStudio';
import CreateHospitality from './pages/CreateHospitality';
import { CreateMenuBuilder } from './pages/CreateMenuBuilder';
import { CreateEventBuilder } from './pages/CreateEventBuilder';
import { CreateLiveMusicBuilder } from './pages/CreateLiveMusicBuilder';
import { CreateWelcomeBuilder } from './pages/CreateWelcomeBuilder';
import { ViewPage } from './pages/ViewPage';
import CreatePlaceholder from './pages/CreatePlaceholder';
import Learn from './pages/Learn';
import LearnCard from './pages/LearnCard';
import ActivityCalendar from './pages/ActivityCalendar';
import TriviaBuilder from './pages/TriviaBuilder';
import HostCreateTrivia from './pages/HostCreateTrivia';
import Room from './pages/Room';

function useShowThemeToggle() {
  const path = useLocation().pathname;
  const isShell = path === '/' || path === '/host' || path === '/join' || path === '/calendar' || path.startsWith('/create') || path.startsWith('/learn') || path.startsWith('/view');
  const isDisplay = path.startsWith('/display');
  return isShell && !isDisplay;
}

export default function App() {
  const showThemeToggle = useShowThemeToggle();
  return (
    <>
      {showThemeToggle && <ThemeToggle />}
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<Host />} />
      <Route path="/host/create" element={<HostCreateTrivia />} />
      <Route path="/host/build/trivia" element={<TriviaBuilder />} />
      <Route path="/room/:roomId" element={<Room />} />
      <Route path="/display/:code" element={<Display />} />
      <Route path="/join" element={<JoinEntry />} />
      <Route path="/join/:code" element={<Play />} />
      <Route path="/create" element={<CreativeStudio />} />
      <Route path="/create/templates" element={<Create />} />
      <Route path="/create/hospitality" element={<CreateHospitality />} />
      <Route path="/create/hospitality/menu" element={<CreateMenuBuilder />} />
      <Route path="/create/hospitality/specials" element={<CreateMenuBuilder />} />
      <Route path="/create/hospitality/event" element={<CreateEventBuilder />} />
      <Route path="/create/hospitality/live-music" element={<CreateLiveMusicBuilder />} />
      <Route path="/create/hospitality/welcome" element={<CreateWelcomeBuilder />} />
      <Route path="/create/education" element={<CreatePlaceholder title="Education & Learning" backTo="/create" backLabel="← All templates" />} />
      <Route path="/create/care" element={<CreatePlaceholder title="Care & Wellness" backTo="/create" backLabel="← All templates" />} />
      <Route path="/create/business" element={<CreatePlaceholder title="Business & Corporate" backTo="/create" backLabel="← All templates" />} />
      <Route path="/create/general" element={<CreatePlaceholder title="General Page" backTo="/create" backLabel="← All templates" />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/:id" element={<LearnCard />} />
      <Route path="/calendar" element={<ActivityCalendar />} />
      <Route path="/view/:slug" element={<ViewPage />} />
    </Routes>
    </>
  );
}
