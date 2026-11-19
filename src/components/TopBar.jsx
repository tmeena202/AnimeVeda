import { Search, Shuffle, Sun, Moon, Bell, User, LogIn } from 'lucide-react';
import '../styles/TopBar.css';

export default function TopBar({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  showTrending,
  searchInputRef,
  theme,
  toggleTheme,
  karma,
  onSurprise,
  currentUser,
  onOpenAuthModal
}) {
  return (
    <header className="top-bar">
      {/* Logo Zone — aligns with sidebar rail */}
      <div className="top-bar-logo-zone" onClick={showTrending}>
        <div className="top-bar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="top-bar-logo-svg" width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="enso-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(var(--dynamic-aura-rgb, 240, 145, 62), 0.9)" />
                <stop offset="100%" stopColor="rgba(var(--dynamic-aura-rgb, 240, 145, 62), 0.15)" />
              </linearGradient>
              <linearGradient id="lotus-gradient-primary" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(var(--dynamic-aura-rgb, 240, 145, 62), 1)" />
                <stop offset="100%" stopColor="rgba(var(--dynamic-aura-rgb, 240, 145, 62), 0.4)" />
              </linearGradient>
              <linearGradient id="lotus-gradient-secondary" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(var(--dynamic-aura-rgb, 240, 145, 62), 0.7)" />
                <stop offset="100%" stopColor="rgba(var(--dynamic-aura-rgb, 240, 145, 62), 0.1)" />
              </linearGradient>
            </defs>
            {/* Calligraphic Ensō circle with varying brush thickness */}
            <path 
              className="logo-enso" 
              d="M 50 12 C 70.98 12 88 29.02 88 50 C 88 70.98 70.98 88 50 88 C 29.02 88 12 70.98 12 50 C 12 34.33 21.5 20.89 35.5 15.3 C 36.88 14.75 37.55 13.18 36.98 11.8 C 36.41 10.42 34.84 9.75 33.46 10.32 C 17.27 16.78 6.3 32.42 6.3 50.45 C 6.3 74.61 25.84 94.15 50 94.15 C 74.16 94.15 93.7 74.61 93.7 50.45 C 93.7 26.29 74.16 6.75 50 6.75 C 47.79 6.75 46 8.54 46 10.75 C 46 12.96 47.79 14.75 50 14.75 Z" 
              fill="url(#enso-gradient)" 
            />
            {/* Lotus bloom petals */}
            {/* Left Outer Petal */}
            <path className="logo-petal outer left" d="M50 78 C35 73 20 62 25 48 C28 42 36 44 42 53 C46 59 48 68 50 78 Z" fill="url(#lotus-gradient-secondary)" />
            {/* Right Outer Petal */}
            <path className="logo-petal outer right" d="M50 78 C65 73 80 62 75 48 C72 42 64 44 58 53 C54 59 52 68 50 78 Z" fill="url(#lotus-gradient-secondary)" />
            {/* Left Inner Petal */}
            <path className="logo-petal inner left" d="M50 78 C41 68 32 55 35 40 C37 32 44 32 47 43 C50 54 50 68 50 78 Z" fill="url(#lotus-gradient-primary)" />
            {/* Right Inner Petal */}
            <path className="logo-petal inner right" d="M50 78 C59 68 68 55 65 40 C63 32 56 32 53 43 C50 54 50 68 50 78 Z" fill="url(#lotus-gradient-primary)" />
            {/* Central Petal */}
            <path className="logo-petal center" d="M50 25 C47 38 45 55 50 78 C55 55 53 38 50 25 Z" fill="url(#lotus-gradient-primary)" />
          </svg>
        </div>
      </div>

      {/* Brand Name — Trilingual Stack */}
      <div className="top-bar-brand-stack" onClick={showTrending} style={{ cursor: 'pointer' }}>
        <span className="brand-sub-label">एनीमे वेद · アニメヴェーダ</span>
        <div className="top-bar-brand">
          ANIME<span>VEDA</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="top-bar-search">
        <form onSubmit={handleSearchSubmit} className="top-bar-search-form">
          <Search className="top-bar-search-icon" size={16} strokeWidth={2.5} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="खोजें · 探す · SEARCH ANIME..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="top-bar-search-input"
            id="global-search-input"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
          />
          <span className="top-bar-search-shortcut">/</span>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="top-bar-actions">
        {/* Surprise Feature */}
        <button
          className="top-bar-action-btn labeled"
          title="Discover a random anime"
          onClick={onSurprise}
          id="random-anime-btn"
        >
          <Shuffle size={16} strokeWidth={2} />
          <span>Surprise</span>
        </button>

        <div className="top-bar-divider"></div>

        {/* Karma Tracker */}
        <div className="top-bar-karma" title="कर्म · カルマ · Karma Points (gain by adding to Vault)">
          <div className="karma-label-stack">
            <span className="karma-sub-label">कर्म · カルマ</span>
            <span className="karma-en-label">KARMA</span>
          </div>
          <span className="karma-value">{karma}</span>
        </div>

        <div className="top-bar-divider"></div>

        {/* Theme Toggle */}
        <button
          className="top-bar-action-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>

        {/* Notification Bell — placeholder for future feature */}
        <button
          className="top-bar-action-btn"
          title="Notifications (coming soon)"
          id="notifications-btn"
        >
          <Bell size={16} strokeWidth={2} />
          <div className="top-bar-badge"></div>
        </button>

        {/* User Profile / Auth Button */}
        {currentUser ? (
          <button
            className="top-bar-user-pill"
            title={`Logged in as ${currentUser.username} (${karma} Karma) — Click for profile & choices`}
            onClick={onOpenAuthModal}
            id="profile-btn"
          >
            <span className="top-bar-user-avatar">{currentUser.avatar || '🦊'}</span>
            <span className="top-bar-user-name">{currentUser.username}</span>
          </button>
        ) : (
          <button
            className="top-bar-login-pill"
            title="Sign In / Create Profile to save your choices"
            onClick={onOpenAuthModal}
            id="login-btn"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
