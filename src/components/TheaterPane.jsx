import '../styles/TheaterPane.css';

export default function TheaterPane({
  selectedAnime,
  currentEpisode,
  cinemaMode,
  setCinemaMode,
  videoRef,
  STREAM_VIDEO_URL,
  toggleWatchlist,
  isInWatchlist,
  playerMode,
  setPlayerMode
}) {
  return (
    <div className="theater-video-pane">
      <div className="ambient-glow-source" style={{ boxShadow: `0 0 100px 30px rgba(0, 242, 254, 0.15)` }}></div>
      
      {/* Player Mode Selection Tabs */}
      <div className="player-mode-bar" style={{ opacity: cinemaMode ? 0.05 : 1, transition: 'opacity 0.3s' }}>
        <button 
          className={`player-mode-btn ${playerMode === 'overview' ? 'active' : ''}`}
          onClick={() => {
            if (videoRef.current) videoRef.current.pause();
            setPlayerMode('overview');
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Overview
        </button>
        <button 
          className={`player-mode-btn ${playerMode === 'trailer' ? 'active' : ''}`}
          onClick={() => {
            setPlayerMode('trailer');
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          Watch Trailer
        </button>
        <button 
          className={`player-mode-btn ${playerMode === 'episode' ? 'active' : ''}`}
          onClick={() => {
            // Pause HTML5 trailer if playing
            if (videoRef.current) {
              videoRef.current.pause();
            }
            setPlayerMode('episode');
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginRight: '6px' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Play Episode {currentEpisode} (SUB)
        </button>
      </div>

      <div className={`player-wrapper ${cinemaMode ? 'cinema-mode' : ''}`}>
        {playerMode === 'overview' ? (
          <div className="overview-hero">
            <img src={selectedAnime.image} alt={selectedAnime.title} className="overview-hero-bg" />
            <div className="overview-hero-overlay"></div>
            <div className="overview-hero-content">
              <button className="btn-watch-now" onClick={() => setPlayerMode('episode')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Watch Now
              </button>
            </div>
          </div>
        ) : playerMode === 'episode' ? (
          <iframe
            src={`https://anixo.buzz/embed/ani/${selectedAnime.id}/${currentEpisode}`}
            className="iframe-element"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`${selectedAnime.title} - Episode ${currentEpisode}`}
          ></iframe>
        ) : selectedAnime.trailerUrl ? (
          <iframe 
            src={selectedAnime.trailerUrl} 
            className="iframe-element" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={`${selectedAnime.title} - Official Trailer`}
          ></iframe>
        ) : (
          <div className="iframe-element" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c', color: '#fff', padding: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</span>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Trailer in Catalog</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '360px', marginBottom: '16px' }}>AniList does not have an official trailer link indexed for this entry.</p>
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedAnime.title + ' official trailer')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ padding: '8px 18px', borderRadius: '4px', background: 'var(--accent-primary)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}
            >
              Search Trailer on YouTube ↗
            </a>
          </div>
        )}

        {playerMode !== 'overview' && (
          <div className="player-header-bar">
            <span className="player-episode-title">
              {selectedAnime.title} - {playerMode === 'episode' ? `Episode ${currentEpisode} HD Stream` : 'Official Trailer'}
            </span>
            <button className="cinema-toggle-btn" onClick={() => setCinemaMode(!cinemaMode)}>
              {cinemaMode ? 'Exit Theater Mode' : 'Theater Mode'}
            </button>
          </div>
        )}
      </div>

      {cinemaMode && (
        <button className="btn-primary exit-cinema-trigger" onClick={() => setCinemaMode(false)}>
          Exit Theater Mode (ESC)
        </button>
      )}

      {/* Metadata, Genres, and Synopsis (Below Player) */}
      <div className="theater-metadata-box" style={{ opacity: cinemaMode ? 0.05 : 1, transition: 'opacity 0.3s' }}>
        <div className="detail-header-text">
          <span className="detail-title-japanese">{selectedAnime.titleJapanese}</span>
          <h2 className="detail-title-english">{selectedAnime.title}</h2>
          
          <div className="detail-pills-row">
            {selectedAnime.score != null && !isNaN(selectedAnime.score) && (
              <span className="detail-pill score">★ {Number(selectedAnime.score).toFixed(2)} Rating</span>
            )}
            <span className="detail-pill pink">{selectedAnime.type || 'TV'}</span>
            <span className="detail-pill">Status: {selectedAnime.status || 'Unknown'}</span>
            
            <button 
              className={`detail-bookmark-btn ${isInWatchlist(selectedAnime.id) ? 'active' : ''}`}
              onClick={() => toggleWatchlist(selectedAnime)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWatchlist(selectedAnime.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {isInWatchlist(selectedAnime.id) ? "In Your Vault" : "Add to Vault"}
            </button>
          </div>

          {selectedAnime.genres && selectedAnime.genres.length > 0 && (
            <div className="detail-genres">
              {selectedAnime.genres.map((genre, idx) => (
                <span key={idx} className="detail-genre-tag">{genre}</span>
              ))}
            </div>
          )}
        </div>

        <div className="detail-synopsis-section">
          <h3 className="detail-section-title">Synopsis</h3>
          <p className="detail-synopsis-text">{selectedAnime.synopsis || 'No synopsis data is registered.'}</p>
        </div>
      </div>
    </div>
  );
}
