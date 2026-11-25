import { Bookmark, Compass, Flame, Sparkles, PlusCircle, ShieldCheck } from 'lucide-react';
import '../styles/WatchlistEmpty.css';

export default function WatchlistEmpty({ showTrending, onExploreGenres }) {
  return (
    <div className="watchlist-empty-wrapper">
      {/* Cinematic Kanji Watermark Backdrop */}
      <div className="vault-empty-watermark" aria-hidden="true">
        保管庫
      </div>

      <div className="watchlist-empty-card">
        {/* Glowing Crest / Icon */}
        <div className="vault-crest-halo">
          <div className="vault-crest-icon">
            <Bookmark size={36} className="vault-crest-svg" />
          </div>
          <span className="vault-crest-sparkle">
            <Sparkles size={16} />
          </span>
        </div>

        {/* Subtitle & Title */}
        <div className="vault-empty-headers">
          <div className="vault-empty-badge">
            <ShieldCheck size={13} />
            <span>ENCRYPTED REPOSITORY · 保管庫</span>
          </div>
          <h3 className="watchlist-empty-title">Your Anime Vault is Pristine</h3>
          <p className="watchlist-empty-jp">まだ保管された作品はありません</p>
        </div>

        <p className="watchlist-empty-text">
          Bookmark series, movies, and seasonal releases to build your personal streaming archive. 
          Your library, watch history, and episode progress stay synced across all your sessions.
        </p>

        {/* Action CTAs */}
        <div className="vault-empty-actions">
          <button className="vault-btn-primary" onClick={showTrending}>
            <Flame size={16} />
            <span>Discover Trending Anime</span>
          </button>

          {onExploreGenres && (
            <button className="vault-btn-secondary" onClick={onExploreGenres}>
              <Compass size={16} />
              <span>Browse by Genre</span>
            </button>
          )}
        </div>

        {/* Quick Tutorial Cards */}
        <div className="vault-empty-hints">
          <div className="vault-hint-card">
            <div className="vault-hint-step">01</div>
            <div className="vault-hint-body">
              <strong>Quick Bookmark</strong>
              <span>Click the <Bookmark size={12} className="inline-icon" /> ribbon on any anime card across the feed.</span>
            </div>
          </div>

          <div className="vault-hint-card">
            <div className="vault-hint-step">02</div>
            <div className="vault-hint-body">
              <strong>Curate from Details</strong>
              <span>Hit "Add to Vault" inside any series page to track episodes & servers.</span>
            </div>
          </div>

          <div className="vault-hint-card">
            <div className="vault-hint-step">03</div>
            <div className="vault-hint-body">
              <strong>Account Synced</strong>
              <span>Sign in to automatically sync your vault across devices and earn Karma.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
