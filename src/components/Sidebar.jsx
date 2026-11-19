import { Home, Compass, CalendarDays, Bookmark, Clock, Grid } from 'lucide-react';
import '../styles/Sidebar.css';

// Trilingual navigation menu items configuration
const SIDEBAR_NAV_ITEMS = [
  {
    icon: Home,
    labelEn: 'HOME',
    labelHi: 'होम',
    labelJp: 'ホーム',
    tabId: 'trending',
    actionType: 'trending',
  },
  {
    icon: Grid,
    labelEn: 'GENRES',
    labelHi: 'शैलियाँ',
    labelJp: 'ジャンル',
    tabId: 'genres',
    actionType: 'genres',
  },
  {
    icon: Compass,
    labelEn: 'EXPLORE',
    labelHi: 'खोज',
    labelJp: '探索',
    tabId: 'search',
    actionType: 'search',
  },
  {
    icon: CalendarDays,
    labelEn: 'SCHEDULE',
    labelHi: 'कार्यक्रम',
    labelJp: 'スケジュール',
    tabId: 'schedule',
    actionType: 'schedule',
  },
  {
    icon: Bookmark,
    labelEn: 'VAULT',
    labelHi: 'तिजोरी',
    labelJp: '保管庫',
    tabId: 'watchlist',
    actionType: 'watchlist',
  },
];

// Upcoming/future release feature items
const UPCOMING_NAV_ITEMS = [
  { 
    icon: Clock, 
    labelEn: 'SEASONAL', 
    labelHi: 'मौसमी', 
    labelJp: 'シーズン' 
  },
];

export default function Sidebar({ activeTab, setActiveTab, view, setView, showTrending }) {

  const handleNavItemClick = (item) => {
    if (item.actionType === 'trending') {
      showTrending();
    } else {
      setView('home');
      setActiveTab(item.tabId);
    }
  };

  const isTabActive = (item) => view === 'home' && activeTab === item.tabId;

  return (
    <aside className="sidebar-container">
      {/* Calligraphy Watermark - Vertical Japanese Editorial style */}
      <div className="sidebar-watermark" aria-hidden="true">アニメヴェーダ</div>

      <nav className="sidebar-menu">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isTabActive(item);
          return (
            <button
              key={item.tabId}
              type="button"
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => handleNavItemClick(item)}
              aria-label={item.labelEn}
            >
              <div className="sidebar-active-indicator"></div>
              <Icon size={20} strokeWidth={2} />
              <div className="sidebar-label-group">
                <span className="sidebar-label-sub">{item.labelHi} · {item.labelJp}</span>
                <span className="sidebar-label-main">{item.labelEn}</span>
              </div>
            </button>
          );
        })}

        <div className="sidebar-divider"></div>

        {UPCOMING_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.labelEn}
              type="button"
              className="sidebar-item future"
              aria-label={`${item.labelEn} (coming soon)`}
              title={`${item.labelEn} — coming soon`}
            >
              <div className="sidebar-active-indicator"></div>
              <Icon size={20} strokeWidth={2} />
              <div className="sidebar-label-group">
                <span className="sidebar-label-sub">{item.labelHi} · {item.labelJp}</span>
                <span className="sidebar-label-main">{item.labelEn}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
