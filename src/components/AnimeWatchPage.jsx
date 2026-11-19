import { useState, useEffect } from 'react';
import '../styles/AnimeWatchPage.css';

const STREAM_SERVERS = [
  {
    id: 'anixo',
    name: 'Server 1 (Anixo HD)',
    getUrl: (anime, ep) => `https://anixo.buzz/embed/ani/${anime.id}/${ep}`
  },
  {
    id: 'animeplay-sub',
    name: 'Server 2 (AnimePlay Sub)',
    getUrl: (anime, ep) => `https://animeplay.icu/stream/mal/${anime.idMal || anime.id}/${ep}/sub`
  },
  {
    id: 'animeplay-dub',
    name: 'Server 3 (AnimePlay Dub)',
    getUrl: (anime, ep) => `https://animeplay.icu/stream/mal/${anime.idMal || anime.id}/${ep}/dub`
  },
  {
    id: 'megaplay-sub',
    name: 'Server 4 (MegaPlay HD)',
    getUrl: (anime, ep) => `https://megaplay.su/mal/${anime.idMal || anime.id}/${ep}/sub`
  },
  {
    id: 'anicdn',
    name: 'Server 5 (AniPlay CDN)',
    getUrl: (anime, ep) => `https://ani.megaplay.su/ani/${anime.id}/${ep}/sub`
  }
];

export default function AnimeWatchPage({
  anime,
  handleBackToDetails,
  currentEpisode,
  selectEpisode,
  isTrailerMode: initialTrailerMode,
  watchedEpisode,
  cinemaMode: propCinemaMode,
  setCinemaMode: propSetCinemaMode,
  preferredServer,
  onServerChange,
}) {
  const [localCinemaMode, setLocalCinemaMode] = useState(false);
  const cinemaMode = propCinemaMode !== undefined ? propCinemaMode : localCinemaMode;
  const setCinemaMode = propSetCinemaMode || setLocalCinemaMode;
  const [manualEpisode, setManualEpisode] = useState(currentEpisode);
  const [selectedServer, setSelectedServer] = useState(preferredServer || 'anixo');
  const [isTrailerMode, setIsTrailerMode] = useState(initialTrailerMode || false);

  useEffect(() => {
    setManualEpisode(currentEpisode);
  }, [currentEpisode]);

  useEffect(() => {
    if (preferredServer) {
      setSelectedServer(preferredServer);
    }
  }, [preferredServer]);

  if (!anime) return null;

  const totalEpisodes = anime.episodes || 0;
  const isUnreleased = anime.status === 'Not yet aired' || anime.status === 'Upcoming';

  const activeServerConfig = STREAM_SERVERS.find(s => s.id === selectedServer) || STREAM_SERVERS[0];
  const streamUrl = activeServerConfig.getUrl(anime, currentEpisode);

  const handleManualEpisodeSubmit = (e) => {
    e.preventDefault();
    const epNum = parseInt(manualEpisode, 10);
    if (!isNaN(epNum) && epNum > 0) {
      setIsTrailerMode(false);
      selectEpisode(epNum);
    }
  };

  return (
    <div className={`watch-page-wrapper ${cinemaMode ? 'cinema-mode' : ''} ${isTrailerMode ? 'trailer-mode' : ''}`}>
      
      {/* Top Header */}
      <div className="watch-header">
        <button className="watch-back-btn" onClick={handleBackToDetails}>
          &larr; Back to Details
        </button>
        <div className="watch-title">
          {anime.title} - {isTrailerMode ? 'Official Trailer' : `Episode ${currentEpisode}`}
        </div>
        <button className="watch-back-btn" onClick={() => setCinemaMode(!cinemaMode)}>
          {cinemaMode ? 'Exit Cinema' : 'Cinema Mode'}
        </button>
      </div>

      <div className="watch-content-area">
        
        {isUnreleased ? (
          <div className="watch-unreleased-fallback">
            <div className="unreleased-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h2>Not Yet Aired</h2>
            <p>This anime is upcoming and has no released episodes yet.</p>
            <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={handleBackToDetails}>
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Main Player */}
            <div className="watch-player-container">
              {/* Mode Toggle: Episode vs Trailer */}
              <div className="watch-mode-bar">
                <button
                  className={`watch-mode-btn ${!isTrailerMode ? 'active' : ''}`}
                  onClick={() => setIsTrailerMode(false)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Episodes
                </button>
                <button
                  className={`watch-mode-btn ${isTrailerMode ? 'active' : ''}`}
                  onClick={() => setIsTrailerMode(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Official Trailer
                </button>
              </div>

              <div className="watch-iframe-wrapper">
                {isTrailerMode ? (
                  anime.trailerUrl ? (
                    <iframe
                      src={anime.trailerUrl}
                      className="watch-iframe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={`${anime.title} - Trailer`}
                    ></iframe>
                  ) : (
                    <div className="watch-trailer-fallback">
                      <div className="trailer-fallback-icon">🎬</div>
                      <h3>No Direct Trailer in Catalog</h3>
                      <p>AniList does not have an official trailer link indexed for this entry.</p>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' official trailer')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fallback-search-btn"
                        style={{ marginTop: '16px' }}
                      >
                        Search Trailer on YouTube ↗
                      </a>
                    </div>
                  )
                ) : (
                  <iframe
                    key={`${selectedServer}-${currentEpisode}-${anime.id}`}
                    src={streamUrl}
                    className="watch-iframe"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`${anime.title} - Episode ${currentEpisode}`}
                  ></iframe>
                )}
              </div>
              
              {/* Server Switcher / Controls */}
              {!isTrailerMode ? (
                <div className="watch-server-controls">
                  <div className="server-toggle-group">
                    <span className="server-label">Server:</span>
                    {STREAM_SERVERS.map((server) => (
                      <button 
                        key={server.id}
                        className={`server-btn ${selectedServer === server.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedServer(server.id);
                          if (onServerChange) onServerChange(server.id);
                        }}
                      >
                        {server.name}
                      </button>
                    ))}
                  </div>
                  
                  <a 
                    href={`https://www.google.com/search?q=Watch+${encodeURIComponent(anime.title)}+episode+${currentEpisode}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="fallback-search-btn"
                  >
                    Video not loading? Search web &rarr;
                  </a>

                  <div className="server-hint-text">
                    💡 If a stream shows an error or buffers, click any alternative server above.
                  </div>
                </div>
              ) : (
                <div className="watch-server-controls">
                  <div className="server-toggle-group">
                    <span className="server-label">Source:</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>Official Promo / Trailer</span>
                  </div>

                  <a 
                    href={anime.trailerId && anime.trailerSite === 'youtube'
                      ? `https://www.youtube.com/watch?v=${anime.trailerId}`
                      : `https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' official trailer')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="fallback-search-btn"
                  >
                    Playback blocked by YouTube? Watch on YouTube ↗
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar: Episode Selector */}
            <aside className="watch-sidebar">
              <div className="watch-sidebar-header">
                Episodes
              </div>
              
              <form className="watch-episode-manual" onSubmit={handleManualEpisodeSubmit}>
                <input 
                  type="number" 
                  min="1" 
                  value={manualEpisode}
                  onChange={(e) => setManualEpisode(e.target.value)}
                  placeholder="Ep #"
                  className="watch-ep-input"
                />
                <button type="submit" className="watch-ep-go-btn">Go</button>
              </form>

              <div className="watch-episode-list">
                {totalEpisodes > 0 ? (
                  Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button 
                      key={ep}
                      className={`watch-ep-btn ${!isTrailerMode && currentEpisode === ep ? 'active' : ''} ${ep <= watchedEpisode ? 'watched' : ''}`}
                      onClick={() => {
                        setIsTrailerMode(false);
                        setManualEpisode(ep);
                        selectEpisode(ep);
                      }}
                    >
                      <span className="watch-ep-num">{ep < 10 ? `0${ep}` : ep}</span>
                      <span className="watch-ep-title">Episode {ep}</span>
                    </button>
                  ))
                ) : (
                  <div className="watch-ep-unknown">
                    Ongoing series (total episodes unknown). Use the input above to select an episode.
                  </div>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
