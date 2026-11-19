import { Play, X } from 'lucide-react';
import '../styles/ContinueWatching.css';

export default function ContinueWatching({ watchHistory, resumeWatch, removeFromWatchHistory }) {
  if (!watchHistory || watchHistory.length === 0) {
    return null; // Don't render the section at all if there's no history
  }

  // Show up to 4 most recently watched anime
  const recentHistory = watchHistory.slice(0, 4);

  return (
    <section className="continue-watching" id="continue-watching">
      <div className="section-header-trilingual">
        <div className="section-header-trilingual-stack">
          <span className="section-header-sub-label">देखना जारी रखें · 視聴を続ける</span>
          <h2 className="section-header-title-main">CONTINUE WATCHING</h2>
        </div>
        <div className="section-header-divider"></div>
      </div>

      <div className="cw-grid">
        {recentHistory.map((item) => {
          const { anime, lastEpisode, totalEpisodes } = item;
          // Calculate progress if totalEpisodes is known, else default to a small visual indicator
          const progressPercent = totalEpisodes > 0 
            ? Math.min(100, (lastEpisode / totalEpisodes) * 100) 
            : 10; 

          return (
            <div 
              key={anime.id} 
              className="cw-card"
              onClick={() => resumeWatch(anime, lastEpisode)}
              title={`Resume ${anime.title} - Episode ${lastEpisode}`}
            >
              <button 
                className="cw-remove-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchHistory(anime.id);
                }}
                title="Remove from history"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
              <div className="cw-image-container">
                <img src={anime.image} alt={anime.title} loading="lazy" />
                <div className="cw-play-overlay">
                  <div className="cw-play-icon">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="cw-progress-container">
                  <div 
                    className="cw-progress-bar" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="cw-info">
                <div className="cw-title">{anime.title}</div>
                <div className="cw-episode-text">
                  Episode {lastEpisode} {totalEpisodes ? `/ ${totalEpisodes}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
