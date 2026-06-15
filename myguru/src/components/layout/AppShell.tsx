import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Brain,
  BookOpen,
  Cpu,
  GraduationCap,
  Home,
  Menu,
  Network,
  Sparkles,
  X,
} from 'lucide-react';

import { tracks } from '../../data/tracks';

const trackIcons: Record<string, typeof BookOpen> = {
  dsa: BookOpen,
  'system-design': Network,
  'ai-ml': Brain,
  'cs-fundamentals': Cpu,
};

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="app-sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar${sidebarOpen ? ' app-sidebar--open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="app-sidebar__header">
          <Link to="/" className="app-sidebar__logo" onClick={closeSidebar}>
            <span className="app-sidebar__logo-icon">
              <GraduationCap size={18} color="white" />
            </span>
            myguru
          </Link>
        </div>

        <nav className="app-sidebar__nav">
          <Link
            to="/"
            className={`app-sidebar__link${location.pathname === '/' ? ' app-sidebar__link--active' : ''}`}
            onClick={closeSidebar}
          >
            <Home size={18} />
            Home
          </Link>

          <p className="app-sidebar__section-label">Learning Tracks</p>
          {tracks.map((track) => {
            const Icon = trackIcons[track.id] ?? Sparkles;
            const isActive = location.pathname.startsWith(`/learn/${track.id}`);
            return (
              <Link
                key={track.id}
                to={`/learn/${track.id}`}
                className={`app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={18} />
                {track.subtitle}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="app-topbar__menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Learn by doing
          </span>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
