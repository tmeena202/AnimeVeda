import { useState, useEffect } from 'react';
import { fetchTopAnime } from '../api';
import Loading from './Loading';
import '../styles/TopAnimeSidebar.css';

export default function TopAnimeSidebar({ handleAnimeSelect }) {
  const [activeTab, setActiveTab] = useState('weekly');
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Map our tabs to Jikan API top filters
        let filter = '';
        if (activeTab === 'weekly') filter = 'airing';
        else if (activeTab === 'monthly') filter = 'bypopularity';
        else if (activeTab === 'yearly') filter = ''; // Default all-time top
        
        const data = await fetchTopAnime(filter);
        if (!cancelled) {
          setAnimeList(data);
        }
      } catch (err) {
        console.error("Failed to load top anime", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();

    return () => { cancelled = true; };
  }, [activeTab]);

  return (
    <aside className="top-anime-sidebar">
      <div className="top-anime-header-stack">
        <span className="top-anime-sub-label">सर्वश्रेष्ठ एनीमे · 人気作品</span>
        <h2 className="top-anime-title-main">TOP ANIME</h2>
      </div>
      
      <div className="top-anime-tabs">
        <button 
          className={`top-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <span className="top-tab-btn-sub">साप्ताहिक · 週間</span>
          <span className="top-tab-btn-main">WEEKLY</span>
        </button>
        <button 
          className={`top-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <span className="top-tab-btn-sub">मासिक · 月間</span>
          <span className="top-tab-btn-main">MONTHLY</span>
        </button>
        <button 
          className={`top-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly')}
        >
          <span className="top-tab-btn-sub">वार्षिक · 年間</span>
          <span className="top-tab-btn-main">YEARLY</span>
        </button>
      </div>

      <div className="top-anime-list">
        {isLoading ? (
          <Loading type="section" size="sm" style={{ padding: '24px 0', minHeight: '120px' }} />
        ) : (
          animeList.map((anime) => (
            <div 
              key={anime.id} 
              className="top-anime-item"
              onClick={() => handleAnimeSelect(anime)}
              role="button"
              tabIndex={0}
            >
              <div className={`top-anime-rank ${anime.rank <= 3 ? 'top-3' : ''}`}>
                {anime.rank}
              </div>
              <div className="top-anime-thumb">
                <img src={anime.image} alt={anime.title} loading="lazy" />
              </div>
              <div className="top-anime-info">
                <h4 className="top-anime-title" title={anime.title}>{anime.title}</h4>
                <div className="top-anime-meta">
                  <span className="top-anime-type">{anime.type || 'TV'}</span>
                  {anime.score != null && !isNaN(anime.score) && <span className="top-anime-score">★ {Number(anime.score).toFixed(1)}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
