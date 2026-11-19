import { useState, useEffect } from 'react';
import { useGridCols } from '../hooks/useGridCols';
import AnimeCard from './AnimeCard';
import { fetchLatestReleases } from '../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from './Loading';
import '../styles/LatestReleases.css';

export default function LatestReleases({ handleAnimeSelect, toggleWatchlist, isInWatchlist }) {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiPage, setApiPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [localPage, setLocalPage] = useState(0);
  const itemsPerPage = useGridCols();

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      if (apiPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const data = await fetchLatestReleases(apiPage);
        if (!cancelled) {
          setReleases(prev => apiPage === 1 ? data.results : [...prev, ...data.results]);
          setHasNextPage(data.hasNextPage);
          if (apiPage > 1) {
            setLocalPage(prev => prev + 1); // advance page after data loads
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !cancelled) {
          console.error('Failed to fetch latest releases:', err);
          if (apiPage === 1) setReleases([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apiPage]);

  const handleNext = () => {
    const nextStartIdx = (localPage + 1) * itemsPerPage;
    const nextEndIdx = nextStartIdx + itemsPerPage;
    
    if (nextEndIdx > releases.length && hasNextPage && !isLoadingMore) {
      setApiPage(prev => prev + 1);
    } else {
      setLocalPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (localPage > 0) {
      setLocalPage(prev => prev - 1);
    }
  };

  let startIdx = localPage * itemsPerPage;
  let endIdx = startIdx + itemsPerPage;
  if (endIdx > releases.length) {
    endIdx = releases.length;
    startIdx = Math.max(0, endIdx - itemsPerPage);
  }
  const visibleReleases = releases.slice(startIdx, endIdx);
  const canGoNext = (localPage + 1) * itemsPerPage < releases.length || hasNextPage;

  return (
    <section className="latest-releases" id="latest-releases">
      <div className="section-header-trilingual">
        <div className="section-header-trilingual-stack">
          <span className="section-header-sub-label">नवीनतम एपिसोड · 最新リリース</span>
          <h2 className="section-header-title-main">LATEST RELEASES</h2>
        </div>
        <div className="section-header-divider"></div>
        {releases.length > itemsPerPage && (
          <div className="pagination-controls">
            <button 
              className="pagination-arrow" 
              onClick={handlePrev} 
              disabled={localPage === 0 || isLoadingMore}
              title="Previous Page"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button 
              className="pagination-arrow" 
              onClick={handleNext} 
              disabled={!canGoNext || isLoadingMore}
              title="Next Page"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {isLoading && apiPage === 1 ? (
        <Loading type="section" message="releases" />
      ) : releases.length === 0 ? (
        <div className="releases-empty">
          No releases found.
        </div>
      ) : (
        <div className="releases-grid-container">
          {isLoadingMore && (
            <Loading type="overlay" />
          )}
          <div className={`anime-grid ${isLoadingMore ? 'loading' : ''}`}>
            {(() => {
              let startIdx = localPage * itemsPerPage;
              let endIdx = startIdx + itemsPerPage;
              if (endIdx > releases.length) {
                endIdx = releases.length;
                startIdx = Math.max(0, endIdx - itemsPerPage);
              }
              const visibleReleases = releases.slice(startIdx, endIdx);
              return visibleReleases.map((anime, index) => (
                <AnimeCard
                  key={`${anime.id}-${index}`}
                  anime={anime}
                  handleAnimeSelect={handleAnimeSelect}
                  toggleWatchlist={toggleWatchlist}
                  isInWatchlist={isInWatchlist}
                />
              ));
            })()}
          </div>
        </div>
      )}
    </section>
  );
}
