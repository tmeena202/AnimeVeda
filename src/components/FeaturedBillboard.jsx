import { useState, useEffect, useCallback } from 'react';
import { Star, Play, Bookmark, ChevronLeft, ChevronRight, Calendar, Clock, Tv, Film } from 'lucide-react';
import '../styles/FeaturedBillboard.css';

export default function FeaturedBillboard({ animes, handleAnimeSelect, toggleWatchlist, isInWatchlist }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeAnimes = Array.isArray(animes) && animes.length > 0 ? animes : [];
  const current = safeAnimes[currentIndex] || null;

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % safeAnimes.length);
  }, [safeAnimes.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + safeAnimes.length) % safeAnimes.length);
  }, [safeAnimes.length]);

  useEffect(() => {
    if (safeAnimes.length <= 1) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [safeAnimes.length, nextSlide]);

  if (!current) return null;

  const isBookmarked = isInWatchlist ? isInWatchlist(current.id) : false;

  const score = current.score != null && !isNaN(current.score) ? Number(current.score).toFixed(1) : 'N/A';
  const format = current.type || 'TV';
  const episodes = current.episodes ? `${current.episodes} eps` : 'Ongoing';
  const genres = current.genres || [];
  const synopsis = current.synopsis
    ? current.synopsis.slice(0, 240) + (current.synopsis.length > 240 ? '…' : '')
    : 'No synopsis available.';
  const titleJP = current.titleJapanese || '';
  const backdrop = current.bannerImage || current.image;

  return (
    <div className="featured-billboard-container">
      {/* ─── 1. Cinematic Full-Bleed Backdrop Image (Ani.pm style) ─── */}
      <div className="bb-backdrop-layer">
        <img
          key={current.id}
          src={backdrop}
          alt={current.title}
          className="bb-backdrop-img"
          loading="eager"
        />
        {/* Multidirectional Gradients for Maximum Legibility */}
        <div className="bb-scrim-left" />
        <div className="bb-scrim-bottom" />
        <div className="bb-scrim-radial" />
        <div className="bb-scrim-top" />
      </div>

      {/* ─── 2. Watermark Japanese Calligraphy ─── */}
      <div className="bb-watermark" aria-hidden="true">
        {titleJP || '注目作品'}
      </div>

      {/* ─── 3. Main Billboard Content Layout ─── */}
      <div className="bb-content-container">
        <div className="bb-info-pane">
          {/* Spotlight Rank Pill */}
          <div className="bb-spotlight-badge">
            <span className="bb-spotlight-tag">
              <Star size={12} fill="currentColor" />
              SPOTLIGHT #{currentIndex + 1}
            </span>
            <span className="bb-spotlight-tri">注目作品</span>
          </div>

          {/* Japanese Subtitle */}
          {titleJP && <div className="bb-kanji-sub">{titleJP}</div>}

          {/* Master English / Romaji Title */}
          <h1 className="bb-hero-title" onClick={() => handleAnimeSelect(current)}>
            {current.title}
          </h1>

          {/* Sleek Metadata Bar (ani.pm style tags) */}
          <div className="bb-meta-bar">
            {score !== 'N/A' && (
              <span className="bb-meta-tag score">
                <Star size={12} fill="currentColor" />
                {score}
              </span>
            )}

            <span className="bb-meta-tag format">
              {format === 'MOVIE' ? <Film size={12} /> : <Tv size={12} />}
              {format}
            </span>

            <span className="bb-meta-tag status">
              <Clock size={12} />
              {current.status || 'AIRING'}
            </span>

            {current.episodes && (
              <span className="bb-meta-tag episodes">
                {episodes}
              </span>
            )}

            {current.year && (
              <span className="bb-meta-tag year">
                <Calendar size={12} />
                {current.year}
              </span>
            )}
          </div>

          {/* Genre Badges Cloud */}
          {genres.length > 0 && (
            <div className="bb-genre-row">
              {genres.slice(0, 4).map((g, idx) => (
                <span key={idx} className="bb-genre-pill">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis Paragraph */}
          <p className="bb-synopsis-text">{synopsis}</p>

          {/* Interactive CTA Buttons */}
          <div className="bb-cta-row">
            <button className="bb-cta-play" onClick={() => handleAnimeSelect(current)}>
              <Play size={16} fill="currentColor" />
              <span>Watch Now</span>
            </button>

            {toggleWatchlist && (
              <button
                className={`bb-cta-vault ${isBookmarked ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(current);
                }}
              >
                <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span>{isBookmarked ? 'In Vault' : 'Add to Vault'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── 4. Right Floating Poster Card (Glassmorphic Showcase) ─── */}
        <div className="bb-floating-poster-pane" onClick={() => handleAnimeSelect(current)}>
          <div className="bb-poster-frame">
            <img
              src={current.image}
              alt={current.title}
              className="bb-floating-poster-img"
              loading="eager"
            />
            <div className="bb-poster-glow" />
            <div className="bb-poster-rank-pill">#{currentIndex + 1}</div>
          </div>
        </div>
      </div>

      {/* ─── 5. Navigation Controls (Arrows & Pagination Pills) ─── */}
      {safeAnimes.length > 1 && (
        <div className="bb-controls-footer">
          <div className="bb-nav-arrows">
            <button className="bb-nav-btn prev" onClick={prevSlide} aria-label="Previous Slide">
              <ChevronLeft size={18} />
            </button>
            <button className="bb-nav-btn next" onClick={nextSlide} aria-label="Next Slide">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="bb-pills-bar">
            {safeAnimes.map((anime, idx) => (
              <button
                key={idx}
                className={`bb-pill-indicator ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                title={anime.title}
              >
                <span className="bb-pill-bar" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
