import { useState, useEffect, useRef } from 'react';
import '../styles/AnimeDetailsPage.css';
import Loading from './Loading';

// Mock community comments — these simulate real users
const MOCK_COMMENTS = [
  {
    id: 'mock-1',
    avatar: 'A',
    username: 'AkiraFan99',
    flag: '🇯🇵',
    time: '2 घंटे पहले · 2時間前 · 2h ago',
    text: 'This series completely changed how I see animation. The art direction is phenomenal — every frame feels hand-painted.',
    hypes: 47,
    hyped: false,
  },
  {
    id: 'mock-2',
    avatar: 'R',
    username: 'रहस्य_हंटर',
    flag: '🇮🇳',
    time: '5 घंटे पहले · 5時間前 · 5h ago',
    text: 'पहले एपिसोड से ही मन मोह लिया। जापानी एनीमे की यह खूबसूरती बेमिसाल है। Must watch for everyone!',
    hypes: 82,
    hyped: false,
  },
  {
    id: 'mock-3',
    avatar: 'T',
    username: 'TokyoDreamer',
    flag: '🇯🇵',
    time: '1 दिन पहले · 1日前 · 1d ago',
    text: 'このアニメのOSTは人生で聞いた中で最高です。ぜひ聞いてみてください！The OST alone is worth the watch.',
    hypes: 130,
    hyped: false,
  },
  {
    id: 'mock-4',
    avatar: 'S',
    username: 'SakuraSenpai',
    flag: '🇬🇧',
    time: '3 दिन पहले · 3日前 · 3d ago',
    text: 'Been an anime fan for over 10 years and this is still one of the best I have encountered. The character development is unreal.',
    hypes: 214,
    hyped: false,
  },
];

export default function AnimeDetailsPage({
  anime,
  handleBackToHome,
  startWatching,
  toggleWatchlist,
  isInWatchlist,
  characters,
  isLoadingCharacters,
  onKarmaGain,
  onGenreClick,
}) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [hypeCount, setHypeCount] = useState(Math.floor(Math.random() * 400) + 200);
  const [hyped, setHyped] = useState(false);
  const [hypeAnimation, setHypeAnimation] = useState(false);
  const [commentPosted, setCommentPosted] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setHyped(false);
    setCommentPosted(false);
    setComments(MOCK_COMMENTS);
    setHypeCount(Math.floor(Math.random() * 400) + 200);
  }, [anime]);

  if (!anime) return null;

  const isBookmarked = isInWatchlist(anime.id);
  const isUnreleased = anime.status === 'Not yet aired' || anime.status === 'Upcoming';
  const hasTrailer = !!anime.trailerUrl;
  const displayCast = characters && characters.length > 0 ? characters.slice(0, 6) : [];

  const handleHype = () => {
    if (!hyped) {
      setHyped(true);
      setHypeCount(c => c + 1);
      setHypeAnimation(true);
      setTimeout(() => setHypeAnimation(false), 600);
    }
  };

  const handleCommentToggle = (commentId) => {
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, hyped: !c.hyped, hypes: c.hyped ? c.hypes - 1 : c.hypes + 1 }
        : c
    ));
  };

  const handlePostComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const newComment = {
      id: `user-${Date.now()}`,
      avatar: 'आ', // Devanagari 'A'
      username: 'आप / あなた / You',
      flag: '🌐',
      time: 'अभी · 今 · Just now',
      text: trimmed,
      hypes: 0,
      hyped: false,
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    if (!commentPosted && onKarmaGain) {
      onKarmaGain(5);
      setCommentPosted(true);
    }
  };

  return (
    <div className="details-page-wrapper">

      {/* Spotlight Aura */}
      <div className="editorial-spotlight"></div>

      {/* Architectural Background Typography */}
      <div className="editorial-bg-texts">
        <div className="editorial-background-text jp">{anime.titleJapanese}</div>
        <div className="editorial-background-text hi">{anime.title}</div>
        <div className="editorial-background-text en">{anime.title}</div>
      </div>

      <div className="editorial-container">

        {/* Compact Top Bar */}
        <div className="details-top-bar">
          <button className="back-button" onClick={handleBackToHome}>
            ← वापस · 戻る · BACK
          </button>
          <span className="details-top-bar-title">{anime.titleJapanese || anime.title}</span>
        </div>

        {/* Hero: Left = info scroll, Right = poster */}
        <div className="editorial-hero">

          {/* LEFT: scrollable content column */}
          <div className="editorial-content-section">
            <h1 className="editorial-title-en">{anime.title}</h1>

            <div className="editorial-synopsis-header">
              <span className="trilingual-label">सारांश · あらすじ · SYNOPSIS</span>
            </div>
            <div className="editorial-synopsis">
              <p>{anime.synopsis || 'DATA NOT FOUND'}</p>
            </div>

            {/* Action Buttons */}
            <div className="editorial-actions">
              <button
                className={`btn-editorial-primary ${isUnreleased ? 'disabled' : ''}`}
                onClick={() => { if (!isUnreleased) startWatching(anime); }}
                disabled={isUnreleased}
              >
                {isUnreleased ? 'अप्रकाशित · 未放送 · UNRELEASED' : '▶ देखें · 視聴 · WATCH'}
              </button>

              <button
                className="btn-editorial-secondary"
                onClick={() => setShowTrailer(true)}
              >
                झलक · 予告 · TRAILER
              </button>

              <button
                className={`btn-editorial-secondary ${isBookmarked ? 'active' : ''}`}
                onClick={() => toggleWatchlist(anime)}
              >
                {isBookmarked ? '✓ VAULTED' : '+ VAULT'}
              </button>

              <button
                className={`btn-hype ${hyped ? 'active' : ''} ${hypeAnimation ? 'pulse' : ''}`}
                onClick={handleHype}
              >
                <span className="hype-icon">🔥</span>
                <span className="hype-text">HYPE</span>
                <span className="hype-count">{hypeCount.toLocaleString()}</span>
              </button>
            </div>

            {/* Voice Cast — scrolls inside left column */}
            <div className="editorial-cast-section">
              <div className="editorial-section-header">
                <span className="editorial-section-title">
                  <span className="trilingual-label">स्वर कलाकार · キャスト · VOICE CAST</span>
                </span>
                <div className="editorial-line"></div>
              </div>

              {isLoadingCharacters ? (
                <Loading type="section" message="cast" />
              ) : displayCast.length > 0 ? (
                <div className="editorial-cast-grid">
                  {displayCast.map((char, index) => (
                    <div key={`${char.id}-${index}`} className="editorial-person-card">
                      <div className="editorial-person-image-container">
                        {char.image && !char.image.includes('apple-touch-icon') ? (
                          <img src={char.image} alt={char.name} className="editorial-person-image" loading="lazy"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div className="person-image-fallback" style={{ display: char.image && !char.image.includes('apple-touch-icon') ? 'none' : 'flex' }}>
                          {char.name.charAt(0)}
                        </div>
                      </div>
                      <div className="editorial-person-info">
                        <div className="editorial-person-name">{char.name}</div>
                        <div className="editorial-person-role">CV · {char.voiceActor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="section-loading">डेटा नहीं मिला · データなし · NO CAST DATA</div>
              )}
            </div>

          </div>

          {/* RIGHT: poster + ledger */}
          <div className="editorial-poster-section">
            <div className="editorial-poster-wrapper">
              <img src={anime.image} alt={anime.title} className="editorial-main-poster" />
              {anime.rank && <div className="editorial-poster-badge">#{anime.rank}</div>}
            </div>

            {/* Ledger Grid */}
            <div className="ledger-grid">
              <div className="ledger-cell">
                <div className="ledger-label"><span className="trilingual-label">अंक · スコア · SCORE</span></div>
                <div className="ledger-value score-val">{anime.score != null && !isNaN(anime.score) ? Number(anime.score).toFixed(2) : 'N/A'}</div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-label"><span className="trilingual-label">प्रारूप · 種類 · FORMAT</span></div>
                <div className="ledger-value">{anime.type || 'TV'}</div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-label"><span className="trilingual-label">प्रकरण · 話数 · EPS</span></div>
                <div className="ledger-value">{anime.episodes || '??'}</div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-label"><span className="trilingual-label">स्थिति · 状況 · STATUS</span></div>
                <div className="ledger-value">{anime.status}</div>
              </div>
              <div className="ledger-cell ledger-full">
                <div className="ledger-label"><span className="trilingual-label">शैली · ジャンル · GENRE</span></div>
                <div className="ledger-value" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {(anime.genres || []).map((genreName, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="genre-tag-pill"
                      onClick={() => onGenreClick && onGenreClick(genreName)}
                      title={`Explore ${genreName} genre page`}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {genreName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={() => setShowTrailer(false)} aria-label="Close Trailer">✕</button>
            {anime.trailerUrl ? (
              <>
                <div className="trailer-video-box">
                  <iframe
                    src={anime.trailerUrl}
                    className="trailer-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={`${anime.title} Trailer`}
                  ></iframe>
                </div>
                <div className="trailer-modal-footer">
                  <span className="trailer-footer-title">{anime.title} — Official Trailer</span>
                  <a
                    href={anime.trailerId && anime.trailerSite === 'youtube'
                      ? `https://www.youtube.com/watch?v=${anime.trailerId}`
                      : `https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' official trailer')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trailer-external-btn"
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              </>
            ) : (
              <div className="trailer-not-found">
                <div className="trailer-not-found-icon">🎬</div>
                <h2>NO DIRECT TRAILER IN CATALOG</h2>
                <p>AniList does not have an official trailer link indexed for this entry.</p>
                <div className="trailer-not-found-actions">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' official anime trailer')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-editorial-primary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '10px 20px' }}
                  >
                    Search Trailer on YouTube ↗
                  </a>
                  <button className="btn-editorial-secondary" onClick={() => setShowTrailer(false)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
