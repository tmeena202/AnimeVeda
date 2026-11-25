import { useState, useEffect } from 'react';
import { 
  Play, 
  Bookmark, 
  Star, 
  Calendar, 
  Clock, 
  Film, 
  Tv, 
  ArrowLeft, 
  Share2, 
  Heart, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  ListPlus,
  Volume2,
  Subtitles,
  Sparkles
} from 'lucide-react';
import '../styles/AnimeDetailsPage.css';
import Loading from './Loading';
import AdBanner from './AdBanner';

// Mock community discussion
const MOCK_COMMENTS = [
  {
    id: 'mock-1',
    avatar: 'A',
    username: 'AkiraFan99',
    flag: '🇯🇵',
    time: '2h ago',
    text: 'This series completely changed how I view modern animation. The pacing and art direction are extraordinary.',
    hypes: 47,
  },
  {
    id: 'mock-2',
    avatar: 'K',
    username: 'KageRider',
    flag: '🇺🇸',
    time: '5h ago',
    text: 'Hooked from episode one! The choreography and soundtrack execution are undeniably top tier.',
    hypes: 82,
  },
  {
    id: 'mock-3',
    avatar: 'T',
    username: 'TokyoDreamer',
    flag: '🇯🇵',
    time: '1d ago',
    text: 'このアニメのOSTは人生で聞いた中で最高です。ぜひ聞いてみてください！The OST alone is worth the watch.',
    hypes: 130,
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
  const [activeTab, setActiveTab] = useState('episodes'); // 'episodes' | 'overview' | 'characters' | 'relations'
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodeSearch, setEpisodeSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setHyped(false);
    setComments(MOCK_COMMENTS);
    setHypeCount(Math.floor(Math.random() * 400) + 200);
    setActiveTab('episodes');
  }, [anime]);

  if (!anime) return null;

  const isBookmarked = isInWatchlist(anime.id);
  const isUnreleased = anime.status === 'Not yet aired' || anime.status === 'Upcoming';
  const displayCast = characters && characters.length > 0 ? characters.slice(0, 16) : [];

  const score = anime.score != null && !isNaN(anime.score) ? Number(anime.score).toFixed(1) : 'N/A';
  const totalEpisodes = anime.episodes || 12;
  const rawEpisodes = Array.from({ length: totalEpisodes }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1}`,
    duration: anime.duration || '24m',
    subAvailable: true,
    dubAvailable: i < 12, // Simulate dub availability indicator
    filler: (i + 1) % 7 === 0, // Mark occasional filler
  }));

  const filteredEpisodes = rawEpisodes.filter(ep => 
    !episodeSearch || 
    ep.number.toString().includes(episodeSearch) || 
    ep.title.toLowerCase().includes(episodeSearch.toLowerCase())
  );

  const handleHype = () => {
    if (!hyped) {
      setHyped(true);
      setHypeCount(c => c + 1);
      if (onKarmaGain) onKarmaGain(5);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePostComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const newComment = {
      id: `user-${Date.now()}`,
      avatar: 'U',
      username: 'You',
      flag: '🌐',
      time: 'Just now',
      text: trimmed,
      hypes: 0,
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    if (onKarmaGain) onKarmaGain(10);
  };

  return (
    <div className="ani-page-wrap">
      {/* ─── 1. Cinematic Wide Backdrop with Dynamic Lighting ─── */}
      <div className="ani-backdrop-wrap">
        <img
          src={anime.bannerImage || anime.image}
          alt={anime.title}
          className="ani-backdrop-img"
        />
        <div className="ani-backdrop-fade-left" />
        <div className="ani-backdrop-fade-bottom" />
        <div className="ani-backdrop-fade-top" />
      </div>

      {/* Top Floating Breadcrumb Bar */}
      <div className="ani-top-bar">
        <button className="ani-back-pill" onClick={handleBackToHome}>
          <ArrowLeft size={16} />
          <span>Browse</span>
        </button>

        <div className="ani-top-bar-right">
          <button className="ani-share-pill" onClick={handleShare}>
            <Share2 size={15} />
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Hero Presentation Container ─── */}
      <div className="ani-hero-stage">
        {/* Poster Showcase Block */}
        <div className="ani-poster-block">
          <div className="ani-poster-frame">
            <img src={anime.image} alt={anime.title} className="ani-poster-img" />
            {anime.rank && <div className="ani-rank-badge">#{anime.rank} SPOTLIGHT</div>}
          </div>

          <div className="ani-poster-cta-group">
            <button
              className={`ani-cta-play ${isUnreleased ? 'disabled' : ''}`}
              onClick={() => { if (!isUnreleased) startWatching(anime, 1); }}
              disabled={isUnreleased}
            >
              <Play size={18} fill="currentColor" />
              <span>{isUnreleased ? 'Not Yet Aired' : 'Watch Ep 1'}</span>
            </button>

            <button
              className={`ani-cta-bookmark ${isBookmarked ? 'active' : ''}`}
              onClick={() => toggleWatchlist(anime)}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? 'In Watchlist' : 'Add to List'}</span>
            </button>
          </div>
        </div>

        {/* Anime Information Stack */}
        <div className="ani-meta-stack">
          {/* Native Japanese / Alternate Title */}
          {anime.titleJapanese && (
            <div className="ani-title-native">{anime.titleJapanese}</div>
          )}

          {/* Master English / Romaji Title */}
          <h1 className="ani-title-main">{anime.title}</h1>

          {/* Quick Attribute Tags (ani.pm pill row) */}
          <div className="ani-tags-row">
            {score !== 'N/A' && (
              <span className="ani-pill score">
                <Star size={13} fill="currentColor" />
                {score}
              </span>
            )}

            <span className="ani-pill format">
              {anime.type === 'MOVIE' ? <Film size={13} /> : <Tv size={13} />}
              {anime.type || 'TV'}
            </span>

            <span className="ani-pill status">
              <Clock size={13} />
              {anime.status || 'AIRING'}
            </span>

            {anime.episodes && (
              <span className="ani-pill episodes">
                {anime.episodes} EPS
              </span>
            )}

            {/* Audio Availability Tags (SUB / DUB) */}
            <span className="ani-pill audio sub">
              <Subtitles size={12} />
              SUB
            </span>
            <span className="ani-pill audio dub">
              <Volume2 size={12} />
              DUB
            </span>

            {anime.year && (
              <span className="ani-pill year">
                <Calendar size={13} />
                {anime.year}
              </span>
            )}
          </div>

          {/* Interactive Genre Chips */}
          <div className="ani-genre-row">
            {(anime.genres || []).map((genreName, idx) => (
              <button
                key={idx}
                type="button"
                className="ani-genre-badge"
                onClick={() => onGenreClick && onGenreClick(genreName)}
                title={`Explore ${genreName} anime`}
              >
                {genreName}
              </button>
            ))}
          </div>

          {/* Synopsis Paragraph */}
          <div className="ani-synopsis-box">
            <h4 className="ani-synopsis-label">OVERVIEW</h4>
            <p className="ani-synopsis-body">{anime.synopsis || 'No synopsis has been provided for this anime title.'}</p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="ani-actions-toolbar">
            <button className={`ani-tool-btn hype ${hyped ? 'active' : ''}`} onClick={handleHype}>
              <Heart size={16} fill={hyped ? 'currentColor' : 'none'} />
              <span>{hypeCount.toLocaleString()} Hypes</span>
            </button>

            {anime.trailerUrl && (
              <button className="ani-tool-btn trailer" onClick={() => setShowTrailer(true)}>
                <Film size={15} />
                <span>Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AdSense Compliant Banner Slot (Details Page) */}
      <div style={{ maxWidth: '1440px', margin: '24px auto 0 auto', padding: '0 48px' }}>
        <AdBanner layout="leaderboard" />
      </div>

      {/* ─── 3. Content Navigation Tabs (ani.pm Layout) ─── */}
      <div className="ani-tabs-wrapper">
        <div className="ani-tabs-nav">
          <button
            className={`ani-tab-anchor ${activeTab === 'episodes' ? 'active' : ''}`}
            onClick={() => setActiveTab('episodes')}
          >
            Episodes ({totalEpisodes})
          </button>
          <button
            className={`ani-tab-anchor ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Details & Specs
          </button>
          <button
            className={`ani-tab-anchor ${activeTab === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveTab('characters')}
          >
            Cast & Characters ({displayCast.length})
          </button>
          <button
            className={`ani-tab-anchor ${activeTab === 'relations' ? 'active' : ''}`}
            onClick={() => setActiveTab('relations')}
          >
            Reviews ({comments.length})
          </button>
        </div>

        {/* Tab Panel 1: ani.pm Style Episode Drawer / Grid */}
        {activeTab === 'episodes' && (
          <div className="ani-panel-body">
            <div className="ani-episodes-control-bar">
              <div className="ani-season-picker">
                <span className="ani-season-title">Season 1 ({totalEpisodes} episodes)</span>
              </div>
              <div className="ani-ep-search-wrap">
                <input
                  type="text"
                  placeholder="Filter episode..."
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  className="ani-ep-search-input"
                />
              </div>
            </div>

            <div className="ani-episodes-shelf-grid">
              {filteredEpisodes.map((ep) => (
                <div
                  key={ep.number}
                  className="ani-episode-card"
                  onClick={() => startWatching(anime, ep.number)}
                >
                  <div className="ani-ep-header">
                    <span className="ani-ep-index">EP {ep.number}</span>
                    <div className="ani-ep-badges">
                      {ep.subAvailable && <span className="ani-ep-sub-badge">SUB</span>}
                      {ep.dubAvailable && <span className="ani-ep-dub-badge">DUB</span>}
                      {ep.filler && <span className="ani-ep-filler-badge">FILLER</span>}
                    </div>
                  </div>
                  <div className="ani-ep-bottom">
                    <span className="ani-ep-name">{ep.title}</span>
                    <div className="ani-ep-play-circle">
                      <Play size={11} fill="currentColor" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Panel 2: Detailed Specifications */}
        {activeTab === 'overview' && (
          <div className="ani-panel-body">
            <div className="ani-specifications-matrix">
              <div className="ani-spec-box">
                <span className="ani-spec-k">Japanese Title</span>
                <span className="ani-spec-v">{anime.titleJapanese || '—'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Format</span>
                <span className="ani-spec-v">{anime.type || 'TV'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Animation Studio</span>
                <span className="ani-spec-v">{anime.studio || 'Unknown'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Broadcast Season</span>
                <span className="ani-spec-v">{anime.season ? `${anime.season.toUpperCase()} ${anime.year || ''}` : anime.year || '—'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Airing Status</span>
                <span className="ani-spec-v">{anime.status || 'Finished'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Episode Duration</span>
                <span className="ani-spec-v">{anime.duration || '24 minutes'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Original Source</span>
                <span className="ani-spec-v">{anime.source || 'Manga'}</span>
              </div>
              <div className="ani-spec-box">
                <span className="ani-spec-k">Community Score</span>
                <span className="ani-spec-v highlight">{score !== 'N/A' ? `★ ${score} / 10` : 'Not Rated'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Panel 3: Voice Cast */}
        {activeTab === 'characters' && (
          <div className="ani-panel-body">
            {isLoadingCharacters ? (
              <Loading type="section" message="cast" />
            ) : displayCast.length > 0 ? (
              <div className="ani-cast-catalog">
                {displayCast.map((char, index) => (
                  <div key={`${char.id}-${index}`} className="ani-cast-card-item">
                    <div className="ani-cast-avatar-frame">
                      {char.image ? (
                        <img src={char.image} alt={char.name} className="ani-cast-pic" loading="lazy" />
                      ) : (
                        <div className="ani-cast-initial">{char.name?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="ani-cast-meta">
                      <span className="ani-char-name">{char.name}</span>
                      <span className="ani-actor-name">CV: {char.voiceActor || 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ani-empty-notice">No character data recorded.</div>
            )}
          </div>
        )}

        {/* Tab Panel 4: Discussion & Reviews */}
        {activeTab === 'relations' && (
          <div className="ani-panel-body">
            <div className="ani-comments-container">
              <div className="ani-comment-box-editor">
                <textarea
                  className="ani-comment-textarea"
                  placeholder="Leave a review or episode impression for other anime fans..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
                <button className="ani-submit-review-btn" onClick={handlePostComment}>
                  <MessageSquare size={14} />
                  <span>Submit Review</span>
                </button>
              </div>

              <div className="ani-comments-stream">
                {comments.map((c) => (
                  <div key={c.id} className="ani-comment-row">
                    <div className="ani-comment-avatar">{c.avatar}</div>
                    <div className="ani-comment-content">
                      <div className="ani-comment-header-meta">
                        <span className="ani-comment-user">{c.username}</span>
                        <span className="ani-comment-time">{c.time}</span>
                      </div>
                      <p className="ani-comment-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AdSense Unit in Details Tab Footer */}
        <div style={{ marginTop: '32px' }}>
          <AdBanner layout="leaderboard" />
        </div>
      </div>

      {/* ─── 4. Trailer Modal ─── */}
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
                  />
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
                <h2>NO TRAILER FOUND</h2>
                <p>AniList does not have an official trailer link indexed for this entry.</p>
                <div className="trailer-not-found-actions">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(anime.title + ' official anime trailer')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ani-cta-play"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '10px 20px' }}
                  >
                    Search on YouTube ↗
                  </a>
                  <button className="ani-cta-bookmark" onClick={() => setShowTrailer(false)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
