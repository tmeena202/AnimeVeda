import { useState, useRef } from 'react';
import { Bookmark, Play, Clock } from 'lucide-react';
import '../styles/AnimeCard.css';

const POPUP_WIDTH  = 260; // matches CSS .hover-window width
const POPUP_HEIGHT = 520; // approximate rendered height of popup

export default function AnimeCard({ anime, handleAnimeSelect, toggleWatchlist, isInWatchlist }) {
  const isBookmarked = isInWatchlist(anime.id);
  const [showTrailer, setShowTrailer] = useState(false);
  const [hoverDir, setHoverDir] = useState({ up: false, left: false });
  const hoverTimer = useRef(null);
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    // Measure card position to decide popup direction
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceRight  = window.innerWidth  - rect.right;
      const spaceBottom = window.innerHeight - rect.top;
      setHoverDir({
        left: spaceRight  < POPUP_WIDTH  + 16,
        up:   spaceBottom < POPUP_HEIGHT,
      });
    }
    if (anime.trailerUrl) {
      hoverTimer.current = setTimeout(() => {
        setShowTrailer(true);
      }, 700);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowTrailer(false);
  };

  const getMutedTrailerUrl = (url) => {
    if (!url) return '';
    // Extract video ID for loop
    const videoId = url.split('/embed/')[1]?.split('?')[0] || '';
    const baseUrl = url.split('?')[0];
    const params = [
      'autoplay=1',
      'mute=1',
      'controls=0',
      'modestbranding=1',
      'playsinline=1',
      'rel=0',
      'iv_load_policy=3',
      'disablekb=1',
      'fs=0',
      'loop=1',
      videoId ? `playlist=${videoId}` : '',
    ].filter(Boolean).join('&');
    return `${baseUrl}?${params}`;
  };

  const seasonFormatted = anime.season ? (anime.season.charAt(0).toUpperCase() + anime.season.slice(1)) : '';
  const releasePeriod = [seasonFormatted, anime.year].filter(Boolean).join(' ') || 'TBA';
  const studioName = anime.studio || (anime.year ? `${anime.year}` : 'TBA');

  const score = anime.score || 0;
  let tierClass = 'score-tier-muted';
  let verdictValue = 'STANDARD';
  let verdictSubClass = 'verdict-standard';

  if (score >= 8.0) {
    tierClass = 'score-tier-premium';
    verdictValue = 'ESSENTIAL';
    verdictSubClass = 'verdict-essential';
  } else if (score >= 7.0) {
    tierClass = 'score-tier-good';
    verdictValue = 'RECOMMENDED';
    verdictSubClass = 'verdict-recommended';
  }

  return (
    <div
      ref={cardRef}
      className={`anime-card ${tierClass}${hoverDir.up ? ' hover-up' : ''}${hoverDir.left ? ' hover-left' : ''}`}
      onClick={() => handleAnimeSelect(anime)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAnimeSelect(anime);
        }
      }}
    >
      <div className="card-image-container">
        <img 
          src={anime.image} 
          alt={anime.title} 
          className="card-image" 
          loading="lazy" 
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="card-image-fallback" style={{ display: 'none' }}>
          <span className="fallback-title">{anime.title}</span>
        </div>
        <div className="card-overlay"></div>
        {/* Bookmark Button (Base) */}
        <button 
          className={`card-bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(anime);
          }}
          title={isBookmarked ? "Remove from Vault" : "Add to Vault"}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2} />
        </button>

        {anime.rank && <div className="card-rank">#{anime.rank}</div>}
        {anime.latestEpisode && (
          <div className="card-rank" style={{ background: 'rgba(255, 77, 106, 0.9)', color: '#fff', fontWeight: 700 }}>
            EP {anime.latestEpisode}
          </div>
        )}
        {anime.airingTime && (
          <div className="card-airing-time">
            ⏱ {anime.airingTime}
          </div>
        )}
        {anime.score != null && !isNaN(anime.score) && (
          <div className="card-rating">
            ⭐ {Number(anime.score).toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="card-info">
        <h3 className="card-title" title={anime.title}>{anime.title}</h3>
      </div>

      {/* Popover Hover Window */}
      <div className="hover-window">
        {/* Calligraphy Watermark Japanese title running vertically in background */}
        {anime.titleJapanese && (
          <div className="hover-window-bg-text" aria-hidden="true">
            {anime.titleJapanese}
          </div>
        )}

        <div className="hover-window-image-container">
          <img 
            src={anime.image} 
            alt={anime.title} 
            className={`hover-window-image ${showTrailer ? 'fade-out' : ''}`} 
            loading="lazy" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {showTrailer && anime.trailerUrl && (
            <iframe 
              src={getMutedTrailerUrl(anime.trailerUrl)} 
              title={`${anime.title} Trailer`}
              className="hover-window-trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          <div className="hover-window-overlay"></div>
        </div>
        
        <div className="hover-window-content">
          <div className="hover-window-actions">
            {anime.status !== 'Not yet aired' && anime.status !== 'Upcoming' ? (
              <button className="hover-window-play-btn" onClick={(e) => {
                e.stopPropagation();
                handleAnimeSelect(anime);
              }} title="Watch Now">
                <Play size={16} fill="currentColor" />
              </button>
            ) : (
              <button className="hover-window-play-btn disabled" disabled title="Not Yet Aired">
                <Clock size={16} fill="currentColor" />
              </button>
            )}
            <button 
              className={`hover-window-bookmark-btn ${isBookmarked ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(anime);
              }}
              title={isBookmarked ? "Remove from Vault" : "Add to Vault"}
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={2} />
            </button>
          </div>

          {/* Specifications Ledger Grid (2x3) */}
          <div className="card-ledger-grid">
            <div className="card-ledger-cell">
              <div className="card-ledger-label">SCORE<span className="card-ledger-tri"> · スコア</span></div>
              <div className="card-ledger-value score">{anime.score != null && !isNaN(anime.score) ? `★ ${Number(anime.score).toFixed(1)}` : '—'}</div>
            </div>
            <div className="card-ledger-cell">
              <div className="card-ledger-label">EPS<span className="card-ledger-tri"> · 話数</span></div>
              <div className="card-ledger-value">{anime.episodes || 'Airing'}</div>
            </div>
            <div className="card-ledger-cell">
              <div className="card-ledger-label">STATUS<span className="card-ledger-tri"> · 状態</span></div>
              <div className="card-ledger-value status">{anime.status || 'Airing'}</div>
            </div>
            <div className="card-ledger-cell">
              <div className="card-ledger-label">STUDIO<span className="card-ledger-tri"> · スタジオ</span></div>
              <div className="card-ledger-value studio" title={anime.studio || 'TBA'}>{anime.studio || 'TBA'}</div>
            </div>
            <div className="card-ledger-cell">
              <div className="card-ledger-label">RELEASE<span className="card-ledger-tri"> · シーズン</span></div>
              <div className="card-ledger-value release" title={releasePeriod}>{releasePeriod}</div>
            </div>
            <div className="card-ledger-cell">
              <div className="card-ledger-label">SOURCE<span className="card-ledger-tri"> · 原作</span></div>
              <div className="card-ledger-value source" title={anime.source || 'TBA'}>{anime.source || 'TBA'}</div>
            </div>
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <div className="hover-window-genres">
              {anime.genres.slice(0, 3).map((g, idx) => (
                <span key={g} className="hover-window-genre-item">
                  {g}{idx < Math.min(2, anime.genres.length - 1) && <span className="genre-dot">•</span>}
                </span>
              ))}
            </div>
          )}
          
          {anime.synopsis && (
            <p className="hover-window-synopsis">{anime.synopsis}</p>
          )}
        </div>
      </div>
    </div>
  );
}
