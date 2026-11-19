import { useState, useEffect, useCallback } from 'react';
import { fetchAnimePictures } from '../api';
import { Star, Play, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/FeaturedBillboard.css';

export default function FeaturedBillboard({ animes, handleAnimeSelect, toggleWatchlist, isInWatchlist }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [extraImages, setExtraImages] = useState([]);

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
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [safeAnimes.length, nextSlide]);

  useEffect(() => {
    if (!current?.id) return;
    setExtraImages([]);
    let cancelled = false;
    fetchAnimePictures(current.id)
      .then(pics => {
        if (!cancelled) {
          const filtered = pics.filter(p => p !== current.image).slice(0, 2);
          setExtraImages(filtered);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentIndex, current?.id, current?.image]);

  if (!current) return null;

  const isBookmarked = isInWatchlist ? isInWatchlist(current.id) : false;

  // Always-fixed data with guaranteed fallbacks
  const score    = current.score != null && !isNaN(current.score) ? Number(current.score).toFixed(1) : 'N/A';
  const format   = current.type || 'TV';
  const episodes = current.episodes || '—';
  const genre    = current.genres?.length > 0 ? current.genres.slice(0, 2).join(' · ') : '—';
  const synopsis = current.synopsis
    ? current.synopsis.slice(0, 200) + (current.synopsis.length > 200 ? '…' : '')
    : 'No synopsis available.';
  const titleJP  = current.titleJapanese || '';

  return (
    <div className="featured-billboard-container">

      {/* Pure CSS background — no image here */}
      <div className="bb-bg" />
      <div className="bb-screentone" />
      <div className="bb-top-fade" />

      {/* Vertical bg text layers */}
      <div className="bb-bg-texts" aria-hidden="true">
        {titleJP && <div className="bb-bg-text jp">{titleJP}</div>}
        <div className="bb-bg-text en">{current.title || ''}</div>
      </div>

      {/* ─── CONTENT LAYOUT ─── */}
      <div className="bb-layout">

        {/* LEFT: Fixed-height text panel */}
        <div className="bb-left">

          {/* Row 1: Eyebrow — always same height */}
          <div className="bb-eyebrow">
            <span className="bb-rank">
              <Star size={10} fill="currentColor" />
              #{currentIndex + 1} FEATURED
            </span>
            <span className="bb-rank-tri">चुनिंदा · 注目作品</span>
            <span className="bb-status">{current.status || 'TV'}</span>
          </div>

          {/* Row 2: JP title — always rendered, empty string if none */}
          <div className="bb-title-jp">{titleJP || '\u00a0'}</div>

          {/* Row 3: Main title — always same clamp */}
          <h2 className="bb-title" onClick={() => handleAnimeSelect(current)}>
            {current.title || 'Untitled'}
          </h2>

          {/* Row 4: Ledger — ALWAYS 4 cells, guaranteed */}
          <div className="bb-ledger">
            <div className="bb-cell">
              <div className="bb-cell-label">SCORE<span className="bb-tri"> · अंक</span></div>
              <div className="bb-cell-value score">{score !== 'N/A' ? `★ ${score}` : 'N/A'}</div>
            </div>
            <div className="bb-cell">
              <div className="bb-cell-label">FORMAT<span className="bb-tri"> · प्रारूप</span></div>
              <div className="bb-cell-value">{format}</div>
            </div>
            <div className="bb-cell">
              <div className="bb-cell-label">EPS<span className="bb-tri"> · प्रकरण</span></div>
              <div className="bb-cell-value">{episodes}</div>
            </div>
            <div className="bb-cell bb-cell-wide">
              <div className="bb-cell-label">GENRE<span className="bb-tri"> · शैली</span></div>
              <div className="bb-cell-value">{genre}</div>
            </div>
          </div>

          {/* Row 5: Synopsis — always same 3-line clamp */}
          <p className="bb-synopsis">{synopsis}</p>

          {/* Row 6: Actions — always same structure */}
          <div className="bb-actions">
            <button className="bb-btn-primary" onClick={() => handleAnimeSelect(current)}>
              <Play size={13} fill="currentColor" />
              VIEW DETAILS
            </button>
            {toggleWatchlist && (
              <button
                className={`bb-btn-secondary ${isBookmarked ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); toggleWatchlist(current); }}
              >
                <Bookmark size={12} fill={isBookmarked ? 'currentColor' : 'none'} strokeWidth={2} />
                {isBookmarked ? 'VAULTED' : 'VAULT'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Fixed poster + fixed-slot thumbnail column */}
        <div className="bb-right">

          {/* Main poster — fixed dimensions */}
          <div className="bb-poster-wrap" onClick={() => handleAnimeSelect(current)}>
            <img
              src={current.image || ''}
              alt={current.title || 'Poster'}
              className="bb-poster"
              loading="eager"
              onError={e => { e.target.style.visibility = 'hidden'; }}
            />
            <div className="bb-poster-rank">#{currentIndex + 1}</div>
          </div>

          {/* Thumbnail column — fixed 2 slots always reserved */}
          <div className="bb-thumbs">
            {[0, 1].map(i => (
              <div key={i} className="bb-thumb" onClick={() => handleAnimeSelect(current)}>
                {extraImages[i] ? (
                  <img
                    src={extraImages[i]}
                    alt={`${current.title} art ${i + 2}`}
                    className="bb-thumb-img"
                    loading="lazy"
                    onError={e => { e.target.style.visibility = 'hidden'; }}
                  />
                ) : (
                  <div className="bb-thumb-empty" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide transition overlay — only visual fade, no layout involvement */}
      {safeAnimes.length > 1 && (
        <>
          <button className="bb-arrow left" onClick={prevSlide} aria-label="Previous">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <button className="bb-arrow right" onClick={nextSlide} aria-label="Next">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
          <div className="bb-dots">
            {safeAnimes.map((_, idx) => (
              <button
                key={idx}
                className={`bb-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
