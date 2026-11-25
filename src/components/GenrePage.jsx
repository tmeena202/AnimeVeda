import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Dices, Sparkles } from 'lucide-react';
import { ANIME_GENRES, GENRE_MOOD_TABS } from '../data/genresData';
import { fetchAnimeByGenre } from '../api';
import AnimeCard from './AnimeCard';
import Loading from './Loading';
import AdBanner from './AdBanner';
import '../styles/GenrePage.css';

export default function GenrePage({
  handleAnimeSelect,
  toggleWatchlist,
  isInWatchlist,
  initialGenreId = null,
  onBackToHub
}) {
  const [selectedGenreId, setSelectedGenreId] = useState(initialGenreId);
  const [selectedMood, setSelectedMood] = useState('all');
  const [genreSearch, setGenreSearch] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'score' | 'trending' | 'newest'
  const [format, setFormat] = useState(''); // '' | 'tv' | 'movie' | 'ova'

  const activeGenre = ANIME_GENRES.find(g => g.id === selectedGenreId) || null;

  // Filter genres in the hub view by search and mood
  const filteredGenres = ANIME_GENRES.filter(g => {
    // Mood filter
    if (selectedMood !== 'all' && g.category !== selectedMood) {
      return false;
    }
    // Search query filter
    if (genreSearch.trim()) {
      const q = genreSearch.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.nameHi.toLowerCase().includes(q) ||
        g.nameJp.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        (g.subtags && g.subtags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  // Load anime whenever activeGenre, sortBy, format, or page changes
  useEffect(() => {
    if (!activeGenre) return;

    let cancelled = false;
    async function loadGenreAnime() {
      setIsLoading(true);
      try {
        const { results, hasNextPage: hasNext } = await fetchAnimeByGenre(
          activeGenre.name,
          sortBy,
          format || null,
          page
        );
        if (!cancelled) {
          setAnimeList(results);
          setHasNextPage(hasNext);
        }
      } catch (err) {
        console.error('Failed to load genre anime:', err);
        if (!cancelled) {
          setAnimeList([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGenreAnime();
    return () => { cancelled = true; };
  }, [activeGenre, sortBy, format, page]);

  // Handle selecting a genre
  const handleSelectGenre = (genreId) => {
    setSelectedGenreId(genreId);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToHub = () => {
    setSelectedGenreId(null);
    setAnimeList([]);
    setPage(1);
    if (onBackToHub) onBackToHub();
  };

  // Genre Surprise / Roll the dice feature
  const handleRollDice = () => {
    if (animeList.length > 0) {
      const randomIndex = Math.floor(Math.random() * animeList.length);
      handleAnimeSelect(animeList[randomIndex]);
    }
  };

  return (
    <div className="genre-page-container">

      {/* ======================================================== */}
      {/* 1. ALL GENRES HUB (EXPLORER MODE)                        */}
      {/* ======================================================== */}
      {!activeGenre ? (
        <>
          <div className="genre-header-zone">
            <div className="section-header-trilingual">
              <div className="section-header-trilingual-stack">
                <span className="section-header-sub-label">ジャンル · GENRE LAB</span>
                <h2 className="section-header-title-main">EXPLORE BY GENRE</h2>
              </div>
              <div className="section-header-divider"></div>
            </div>

            {/* Mood Category Pills & Search Row */}
            <div className="genre-toolbar-row">
              <div className="genre-mood-pills">
                {GENRE_MOOD_TABS.map((mood) => (
                  <button
                    key={mood.id}
                    className={`genre-mood-pill ${selectedMood === mood.id ? 'active' : ''}`}
                    onClick={() => setSelectedMood(mood.id)}
                  >
                    <span>{mood.icon}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* Genre Search Input */}
              <div className="genre-search-box">
                <Search size={14} className="genre-search-icon" />
                <input
                  type="text"
                  placeholder="Filter genres by name..."
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                  className="genre-search-input"
                />
              </div>
            </div>
          </div>

          {/* Visual Cinematic Genre Portals Grid */}
          <div className="genres-visual-grid">
            {filteredGenres.map((genre) => (
              <div
                key={genre.id}
                className="genre-portal-card"
                style={{
                  '--genre-color': genre.color,
                  '--genre-aura': genre.auraRgb,
                }}
                onClick={() => handleSelectGenre(genre.id)}
              >
                {/* Visual Backdrop Artwork */}
                <img
                  src={genre.bannerImg}
                  alt={genre.name}
                  className="genre-portal-bg"
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />

                {/* Scrim & Aura Gradients */}
                <div className="genre-portal-scrim" />
                <div className="genre-portal-aura" />

                {/* Japanese Kanji Calligraphy Watermark */}
                <div className="genre-portal-kanji">{genre.kanji}</div>

                {/* Top Badge */}
                <div className="genre-portal-top-badge">
                  <span>{genre.icon}</span>
                  <span>{genre.nameJp}</span>
                </div>

                {/* Card Bottom Content */}
                <div className="genre-portal-content">
                  <div className="genre-portal-title-row">
                    <h3 className="genre-portal-name">{genre.nameEn}</h3>
                    <span className="genre-portal-jp">{genre.nameHi}</span>
                  </div>

                  <p className="genre-portal-tagline">{genre.tagline}</p>

                  {/* Subtag pills */}
                  <div className="genre-portal-subtags">
                    {genre.subtags?.map((tag, idx) => (
                      <span key={idx} className="genre-portal-subtag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 2. SINGLE GENRE DETAIL SHOWCASE ("ONE BY ONE") */}
          {/* Hero Billboard for Active Genre */}
          <div
            className="genre-showcase-hero"
            style={{
              '--genre-color': activeGenre.color,
              '--genre-aura': activeGenre.auraRgb,
            }}
          >
            {/* Visual Blurred Backdrop */}
            <img
              src={activeGenre.bannerImg}
              alt={activeGenre.name}
              className="genre-showcase-backdrop"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            <div className="genre-showcase-scrim" />
            <div className="genre-showcase-kanji">{activeGenre.kanji}</div>

            {/* Breadcrumb Navigation */}
            <div className="genre-showcase-nav">
              <button className="genre-nav-back-btn" onClick={handleReturnToHub}>
                <ArrowLeft size={14} />
                <span>All Genres · 全ジャンル</span>
              </button>
            </div>

            {/* Content Stack */}
            <div className="genre-showcase-content">
              <div className="genre-showcase-title-row">
                <h1 className="genre-showcase-title">
                  <span>{activeGenre.icon}</span>
                  {activeGenre.nameEn}
                </h1>
                <span className="genre-showcase-jp">
                  {activeGenre.nameJp}
                </span>
              </div>

              <p className="genre-showcase-tagline">
                {activeGenre.tagline}
              </p>
            </div>
          </div>

          {/* Quick-Switch Genre Selector - Fully responsive wrapping grid */}
          <div className="genre-switcher-container">
            <div className="genre-switcher-header">
              <span className="genre-switcher-label">
                QUICK SWITCH GENRE ({ANIME_GENRES.length}):
              </span>
            </div>
            <div className="genre-chips-wrap">
              {ANIME_GENRES.map((g) => (
                <button
                  key={g.id}
                  className={`genre-rail-chip ${g.id === activeGenre.id ? 'active' : ''}`}
                  style={{
                    '--genre-color': g.color,
                    '--genre-aura': g.auraRgb,
                  }}
                  onClick={() => handleSelectGenre(g.id)}
                  title={`Switch to ${g.nameEn}`}
                >
                  <span>{g.icon}</span>
                  <span>{g.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter & Sort Controls Deck */}
          <div 
            className="genre-filter-deck"
            style={{
              '--genre-color': activeGenre.color,
              '--genre-aura': activeGenre.auraRgb,
            }}
          >
            {/* Sort Segmented Control */}
            <div className="genre-deck-section">
              <span className="genre-deck-label">Sort:</span>
              <div className="genre-segmented-control">
                {[
                  { id: 'popular', label: '🔥 Popular' },
                  { id: 'score', label: '⭐ Top Rated' },
                  { id: 'trending', label: '📈 Trending' },
                  { id: 'newest', label: '✨ Newest' },
                ].map((s) => (
                  <button
                    key={s.id}
                    className={`genre-segmented-btn ${sortBy === s.id ? 'active' : ''}`}
                    onClick={() => { setSortBy(s.id); setPage(1); }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Segmented Control */}
            <div className="genre-deck-section">
              <span className="genre-deck-label">Format:</span>
              <div className="genre-segmented-control">
                {[
                  { id: '', label: 'All' },
                  { id: 'tv', label: 'TV Series' },
                  { id: 'movie', label: 'Movies' },
                  { id: 'ova', label: 'OVAs' },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={`genre-segmented-btn ${format === f.id ? 'active' : ''}`}
                    onClick={() => { setFormat(f.id); setPage(1); }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Roll Dice in Genre */}
            <button
              type="button"
              className="genre-dice-btn"
              onClick={handleRollDice}
              title="Pick a random anime from this genre"
            >
              <Dices size={16} />
              <span>Surprise Me</span>
            </button>
          </div>

          {/* Anime Grid */}
          {isLoading ? (
            <Loading type="page" message={`Loading ${activeGenre.nameEn} titles...`} />
          ) : animeList.length === 0 ? (
            <div className="error-container" style={{ margin: '30px 0' }}>
              <h3>No Anime Found</h3>
              <div className="error-text">No titles matched the selected format filter for {activeGenre.nameEn}.</div>
              <button 
                className="btn-secondary" 
                style={{ marginTop: '16px', width: 'fit-content' }}
                onClick={() => setFormat('')}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <AdBanner layout="leaderboard" />
              <div className="anime-grid">
                {animeList.map((anime, index) => (
                  <AnimeCard
                    key={`${anime.id}-${index}`}
                    anime={anime}
                    handleAnimeSelect={handleAnimeSelect}
                    toggleWatchlist={toggleWatchlist}
                    isInWatchlist={isInWatchlist}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="pagination-wrapper" style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
                <button
                  className="pagination-arrow"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  title="Previous Page"
                >
                  <ChevronLeft size={18} />
                </button>

                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Page {page}
                </span>

                <button
                  className="pagination-arrow"
                  disabled={!hasNextPage}
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  title="Next Page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}
