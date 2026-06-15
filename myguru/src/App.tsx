import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import LabPage from './pages/LabPage';
import TrackPage from './pages/TrackPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn/:track" element={<TrackPage />} />
          <Route path="/lab/:module" element={<LabPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
