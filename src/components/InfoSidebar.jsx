import Loading from './Loading';
import '../styles/TheaterPane.css';

export default function InfoSidebar({
  selectedAnime,
  detailsTab,
  setDetailsTab,
  currentEpisode,
  selectEpisode,
  isLoadingCharacters,
  characters,
  isLoadingRecommendations,
  recommendations,
  handleAnimeSelect
}) {
  return (
    <aside className="theater-info-sidebar">
      
      {/* Tab Navigation in Sidebar */}
      <div className="sidebar-tabs">
        <button className={`sidebar-tab-btn ${detailsTab === 'episodes' ? 'active' : ''}`} onClick={() => setDetailsTab('episodes')}>
          Episodes
        </button>
        <button className={`sidebar-tab-btn ${detailsTab === 'cast' ? 'active' : ''}`} onClick={() => setDetailsTab('cast')}>
          Cast
        </button>
        <button className={`sidebar-tab-btn ${detailsTab === 'recs' ? 'active' : ''}`} onClick={() => setDetailsTab('recs')}>
          Similar
        </button>
      </div>

      <div className="sidebar-tab-content">
        
        {/* Tab 1: Episode Selector */}
        {detailsTab === 'episodes' && (
          <div className="sidebar-scrollable-content">
            <h4 className="sidebar-section-title">Select Episode</h4>
            <div className="episode-selector-list">
              {Array.from({ length: selectedAnime?.episodes || 12 }, (_, i) => i + 1).map((ep) => (
                <button 
                  key={ep}
                  className={`episode-row-btn ${currentEpisode === ep ? 'active' : ''}`}
                  onClick={() => selectEpisode(ep)}
                >
                  <span className="ep-number">{ep < 10 ? `0${ep}` : ep}</span>
                  <span className="ep-title">Episode {ep} - Streaming HD</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Cast list */}
        {detailsTab === 'cast' && (
          <div className="sidebar-scrollable-content">
            <h4 className="sidebar-section-title">Characters & Voice Cast</h4>
            {isLoadingCharacters ? (
              <Loading type="section" message="cast" />
            ) : characters.length === 0 ? (
              <div className="section-loading">No character biographies found.</div>
            ) : (
              <div className="cast-list">
                {characters.map((char, index) => (
                  <div key={`${char.id}-${index}`} className="cast-row-card">
                    <img src={char.image} alt={char.name} className="cast-photo-thumbnail" />
                    <div className="cast-details">
                      <div className="cast-char-name">{char.name}</div>
                      <div className="cast-role">{char.role} - <span className="cast-actor">{char.voiceActor}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recommendations list */}
        {detailsTab === 'recs' && (
          <div className="sidebar-scrollable-content">
            <h4 className="sidebar-section-title">More Like This</h4>
            {isLoadingRecommendations ? (
              <Loading type="section" message="recs" />
            ) : recommendations.length === 0 ? (
              <div className="section-loading">No recommendations found.</div>
            ) : (
              <div className="recs-list">
                {recommendations.map((rec, index) => (
                  <div key={`${rec.id}-${index}`} className="rec-row-card" onClick={() => handleAnimeSelect(rec)}>
                    <img src={rec.image} alt={rec.title} className="rec-photo-thumbnail" />
                    <div className="rec-details">
                      <div className="rec-title">{rec.title}</div>
                      {rec.votes && <div className="rec-votes">👍 {rec.votes} matches</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
}
