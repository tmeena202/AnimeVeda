import { useEffect } from 'react';
import '../styles/AdBanner.css';

/**
 * AdBanner - Google AdSense Safe Placement Component
 * 
 * Rules:
 * 1. Only loads and renders on safe discovery pages (Home, Details, Genres, Schedule).
 * 2. Never rendered on video playback or streaming views.
 * 3. In development / testing (when no client ID is provided), renders a clean placeholder slot
 *    so your layout doesn't shift and you can see exact ad dimensions.
 */
export default function AdBanner({ 
  slotId = '0000000000', 
  format = 'auto', 
  responsive = 'true',
  layout = 'horizontal', // 'horizontal' (728x90) | 'rectangle' (300x250) | 'leaderboard'
  className = '' 
}) {
  // Ensure the client ID has the required 'ca-' prefix for Google AdSense
  const rawId = import.meta.env.VITE_ADSENSE_CLIENT_ID || null;
  const adClientId = rawId ? (rawId.startsWith('ca-') ? rawId : `ca-${rawId}`) : null;

  useEffect(() => {
    // Only attempt to push when in a live production environment or when adsbygoogle exists
    if (adClientId && typeof window !== 'undefined') {
      try {
        const adsbygoogle = window.adsbygoogle || [];
        adsbygoogle.push({});
      } catch (err) {
        // Silently catch extension/adblock suppression errors
      }
    }
  }, [adClientId, slotId]);

  return (
    <div className={`ad-placement-wrapper ad-${layout} ${className}`} aria-label="Sponsored Advertisement">
      <div className="ad-label-tag">SPONSORED · ADVERTISEMENT</div>

      {adClientId ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={adClientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      ) : (
        /* Preview / Placeholder Slot when VITE_ADSENSE_CLIENT_ID is not yet configured */
        <div className="ad-placeholder-box">
          <div className="ad-placeholder-inner">
            <span className="ad-brand">Google AdSense Space</span>
            <span className="ad-dimensions">
              {layout === 'horizontal' ? '728 × 90 Leaderboard' : layout === 'rectangle' ? '300 × 250 Medium Rectangle' : 'Responsive Ad Unit'}
            </span>
            <span className="ad-notice">Configure VITE_ADSENSE_CLIENT_ID in .env to activate live Google ads</span>
          </div>
        </div>
      )}
    </div>
  );
}
