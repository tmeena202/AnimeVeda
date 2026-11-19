import { useState, useEffect, useRef } from 'react';
import { fetchTrending, searchAnime, fetchAnimeCharacters, fetchSchedule, fetchAnimeDetails, fetchAnimeRecommendations, fetchRandomAnime } from './api';

// Import CSS Stylesheet Modules
import './styles/Layout.css';
import './styles/TopBar.css';
import './styles/Sidebar.css';
import './styles/FeaturedBillboard.css';
import './styles/AnimeCard.css';
import './styles/ScheduleNav.css';
import './styles/WatchlistEmpty.css';
import './styles/TheaterPane.css';
import './styles/AdvancedSearch.css';
import './styles/Pagination.css';
import './styles/LatestReleases.css';
import './styles/ContentFooter.css';

// Import Custom Modular Components
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import FeaturedBillboard from './components/FeaturedBillboard';
import AnimeCard from './components/AnimeCard';
import ScheduleNav from './components/ScheduleNav';
import WatchlistEmpty from './components/WatchlistEmpty';
import AnimeDetailsPage from './components/AnimeDetailsPage';
import AnimeWatchPage from './components/AnimeWatchPage';
import ContentFooter from './components/ContentFooter';
import LatestReleases from './components/LatestReleases';
import UpcomingReleases from './components/UpcomingReleases';
import ContinueWatching from './components/ContinueWatching';
import TopAnimeSidebar from './components/TopAnimeSidebar';
import Loading from './components/Loading';
import AuthModal from './components/AuthModal';
import GenrePage from './components/GenrePage';
import { ANIME_GENRES } from './data/genresData';
import { getCurrentUser, getGuestData, saveCurrentUserData, logoutUser } from './utils/auth';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'details'
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // User Authentication & Choice Remembering System
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize individual user choices (Watchlist, History, Karma, Theme)
  const [watchlist, setWatchlist] = useState(() => {
    const user = getCurrentUser();
    if (user?.data?.watchlist) return user.data.watchlist;
    return getGuestData().watchlist || [];
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    const user = getCurrentUser();
    if (user?.data?.watchHistory) return user.data.watchHistory;
    return getGuestData().watchHistory || [];
  });

  const [karma, setKarma] = useState(() => {
    const user = getCurrentUser();
    if (user?.data?.karma !== undefined) return user.data.karma;
    return getGuestData().karma || 0;
  });

  const [theme, setTheme] = useState(() => {
    const user = getCurrentUser();
    if (user?.data?.theme) return user.data.theme;
    return getGuestData().theme || 'dark';
  });

  // Automatically remember & persist user choices to their active profile or guest data
  useEffect(() => {
    saveCurrentUserData({ watchlist });
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    saveCurrentUserData({ watchHistory });
    localStorage.setItem('watch_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    saveCurrentUserData({ karma });
    localStorage.setItem('anime_karma', karma.toString());
  }, [karma]);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    saveCurrentUserData({ theme });
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth event listeners: restore that user's specific choices seamlessly
  const [preferredServer, setPreferredServer] = useState(() => {
    const user = getCurrentUser();
    return user?.data?.preferredServer || 'anixo';
  });

  const handleServerChange = (newServer) => {
    setPreferredServer(newServer);
    saveCurrentUserData({ preferredServer: newServer });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user?.data) {
      setWatchlist(user.data.watchlist || []);
      setWatchHistory(user.data.watchHistory || []);
      setKarma(user.data.karma ?? 0);
      if (user.data.theme) {
        setTheme(user.data.theme);
      }
      if (user.data.preferredServer) {
        setPreferredServer(user.data.preferredServer);
      }
    }
    if (selectedAnime) {
      const historyItem = (user?.data?.watchHistory || []).find(item => item.anime.id === selectedAnime.id);
      setCurrentEpisode(historyItem ? historyItem.lastEpisode : 1);
    }
    triggerToast(`Welcome back, ${user.username}! Choices & Vault restored.`);
  };

  const handleLogoutSuccess = () => {
    logoutUser();
    setCurrentUser(null);
    const guest = getGuestData();
    setWatchlist(guest.watchlist || []);
    setWatchHistory(guest.watchHistory || []);
    setKarma(guest.karma ?? 0);
    setTheme(guest.theme || 'dark');
    setPreferredServer(guest.preferredServer || 'anixo');
    if (selectedAnime) {
      const historyItem = (guest.watchHistory || []).find(item => item.anime.id === selectedAnime.id);
      setCurrentEpisode(historyItem ? historyItem.lastEpisode : 1);
    }
    triggerToast('Logged out. Browsing as Guest.');
  };

  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trending'); // 'trending' | 'search' | 'watchlist' | 'schedule' | 'genres'
  const [selectedGenreId, setSelectedGenreId] = useState(null);

  const openGenre = (genreIdentifier) => {
    if (!genreIdentifier) {
      setSelectedGenreId(null);
    } else {
      const match = ANIME_GENRES.find(
        g => g.id.toLowerCase() === genreIdentifier.toLowerCase() || 
             g.name.toLowerCase() === genreIdentifier.toLowerCase()
      );
      setSelectedGenreId(match ? match.id : genreIdentifier.toLowerCase());
    }
    setView('home');
    setActiveTab('genres');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Custom video player states
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [isTrailerMode, setIsTrailerMode] = useState(false);
  const videoRef = useRef(null);
  const [detailsTab, setDetailsTab] = useState('episodes'); // 'episodes' | 'cast' | 'recs'
  const [playerMode, setPlayerMode] = useState('trailer'); // 'trailer' | 'episode'

  // Airing schedule states
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const initialDay = weekdays[todayIndex === 0 ? 6 : todayIndex - 1];
  const [scheduleDay, setScheduleDay] = useState(initialDay);
  const [scheduleAnime, setScheduleAnime] = useState([]);

  // Debounced day state to prevent rapid-click network request flooding
  const [debouncedScheduleDay, setDebouncedScheduleDay] = useState(initialDay);

  // UX states
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const searchInputRef = useRef(null);

  // Advanced search and filters states
  const [searchFormat, setSearchFormat] = useState(''); // '' | 'tv' | 'movie' | 'ova' | 'special'
  const [searchGenre, setSearchGenre] = useState(''); // '' | '1' | '2' | etc.
  const hasActiveSearchFilters = searchQuery.trim() !== '' || searchFormat !== '' || searchGenre !== '';

  // Pagination states
  const [trendingPage, setTrendingPage] = useState(1);
  const [hasMoreTrending, setHasMoreTrending] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const formats = [
    { label: 'All Formats', value: '' },
    { label: 'TV', value: 'tv' },
    { label: 'Movie', value: 'movie' },
    { label: 'OVA', value: 'ova' },
    { label: 'Special', value: 'special' }
  ];

  const genres = [
    { label: 'All Genres', value: '' },
    { label: 'Action', value: 'Action' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Comedy', value: 'Comedy' },
    { label: 'Drama', value: 'Drama' },
    { label: 'Fantasy', value: 'Fantasy' },
    { label: 'Sci-Fi', value: 'Sci-Fi' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Horror', value: 'Horror' },
    { label: 'Mystery', value: 'Mystery' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Supernatural', value: 'Supernatural' },
    { label: 'Slice of Life', value: 'Slice of Life' },
    { label: 'Psychological', value: 'Psychological' },
    { label: 'Thriller', value: 'Thriller' },
    { label: 'Mecha', value: 'Mecha' },
    { label: 'Music', value: 'Music' }
  ];

  // Trigger floating toast notification
  const triggerToast = (message) => {
    setToast({ message, visible: true });
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2500);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedScheduleDay(scheduleDay);
    }, 300);
    return () => clearTimeout(handler);
  }, [scheduleDay]);

  // Load trending anime on mount
  useEffect(() => {
    async function loadTrending() {
      setIsLoading(true);
      setError(null);
      try {
        const { results, hasNextPage } = await fetchTrending(1);
        setTrendingAnime(results);
        setHasMoreTrending(hasNextPage);
      } catch (err) {
        setError(err.message || 'Failed to load trending anime.');
      } finally {
        setIsLoading(false);
      }
    }
    loadTrending();
  }, []);

  // Handle escape key to exit cinema mode and scroll tracking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCinemaMode(false);
      }
    };
    
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);



  // Global keydown listeners for shortcuts
  useEffect(() => {
    const handleShortcuts = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (!isInput) {
        // "/" focuses search input
        if (e.key === '/') {
          e.preventDefault();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  // Fetch schedule when debouncedScheduleDay or activeTab changes
  useEffect(() => {
    if (activeTab !== 'schedule') return;
    
    const controller = new AbortController();

    async function loadSchedule() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSchedule(debouncedScheduleDay, controller.signal);
        setScheduleAnime(data);
        setIsLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load airing schedules.');
          setIsLoading(false);
        }
      }
    }
    loadSchedule();

    return () => {
      controller.abort();
    };
  }, [debouncedScheduleDay, activeTab]);

  // Execute Search query with active filters and page resets
  const executeAdvancedSearch = async (query, format = '', genre = '') => {
    const trimmed = query.trim();
    
    // If empty query and no filters, reset to trending view
    if (!trimmed && !format && !genre) {
      setSearchResults([]);
      setHasMoreSearch(false);
      setIsSearching(false);
      setActiveTab('search');
      return;
    }

    setIsSearching(true);
    setError(null);
    setView('home');
    setActiveTab('search');
    setSearchPage(1); // Reset page count
    
    try {
      const { results, hasNextPage } = await searchAnime(trimmed, format, genre, 1);
      setSearchResults(results);
      setHasMoreSearch(hasNextPage);
    } catch (err) {
      setError(err.message || "Search request failed. Please try again later.");
      setHasMoreSearch(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Load more trending anime pages
  const handleLoadMoreTrending = async () => {
    setIsLoadingMore(true);
    const nextPage = trendingPage + 1;
    try {
      const { results, hasNextPage } = await fetchTrending(nextPage);
      setTrendingAnime(prev => [...prev, ...results]);
      setTrendingPage(nextPage);
      setHasMoreTrending(hasNextPage);
    } catch (err) {
      triggerToast("Failed to fetch more trending entries");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load more search results pages
  const handleLoadMoreSearch = async () => {
    setIsLoadingMore(true);
    const nextPage = searchPage + 1;
    try {
      const { results, hasNextPage } = await searchAnime(searchQuery, searchFormat, searchGenre, nextPage);
      setSearchResults(prev => [...prev, ...results]);
      setSearchPage(nextPage);
      setHasMoreSearch(hasNextPage);
    } catch (err) {
      triggerToast("Failed to fetch more search entries");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    executeAdvancedSearch(searchQuery, searchFormat, searchGenre);
  };

  // Switch back to trending and reset filters
  const showTrending = () => {
    setView('home');
    setActiveTab('trending');
    setSearchQuery('');
    setSearchFormat('');
    setSearchGenre('');
    setTrendingPage(1); // Reset trending pages too
  };

  const handleFormatChange = (format) => {
    setSearchFormat(format);
    executeAdvancedSearch(searchQuery, format, searchGenre);
  };

  const handleGenreChange = (genre) => {
    setSearchGenre(genre);
    executeAdvancedSearch(searchQuery, searchFormat, genre);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchFormat('');
    setSearchGenre('');
    executeAdvancedSearch('', '', '');
  };

  // Toggle show in watchlist (My Vault)
  const toggleWatchlist = (anime) => {
    setWatchlist((prev) => {
      let updated;
      const exists = prev.some((x) => x.id === anime.id);
      if (exists) {
        updated = prev.filter((x) => x.id !== anime.id);
        triggerToast(`Removed "${anime.title.slice(0, 24)}..." from Vault`);
      } else {
        const minimalAnime = {
          id: anime.id,
          title: anime.title,
          image: anime.image,
          score: anime.score,
          type: anime.type,
          episodes: anime.episodes,
          genres: anime.genres || []
        };
        updated = [...prev, minimalAnime];
        setKarma(k => k + 10); // Gamification: +10 karma for adding
        triggerToast(`Added "${anime.title.slice(0, 24)}..." to Vault`);
      }
      try {
        localStorage.setItem('watchlist', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save watchlist to localStorage', e);
      }
      return updated;
    });
  };

  const isInWatchlist = (id) => {
    return watchlist.some((x) => x.id === id);
  };

  // Open anime full page details, fetch details if partial, and fetch characters/recommendations
  const handleAnimeSelect = async (anime) => {
    setView('details');
    setIsLoadingCharacters(true);
    setIsLoadingRecommendations(true);
    setCurrentEpisode(1);
    setCinemaMode(false);
    setPlayerMode('overview'); // Legacy state not needed anymore but harmless
    // Note: detailsTab is also legacy
    
    // Instant scroll to top to prevent opening page in a scrolled-down state
    window.scrollTo(0, 0);

    try {
      let fullAnime = anime;
      // If we don't have complete data (e.g., when clicked from recommendations), fetch full details
      if (!anime.genres || !anime.synopsis) {
        setIsLoading(true);
        fullAnime = await fetchAnimeDetails(anime.id);
      }
      setSelectedAnime(fullAnime);

      // Fetch characters and recommendations in parallel
      const [charData, recData] = await Promise.all([
        fetchAnimeCharacters(fullAnime.id),
        fetchAnimeRecommendations(fullAnime.id)
      ]);
      setCharacters(charData);
      setRecommendations(recData);
    } catch (err) {
      console.error('Error fetching details sections:', err);
    } finally {
      setIsLoadingCharacters(false);
      setIsLoadingRecommendations(false);
      setIsLoading(false);
    }
  };

  // Return to home lists and auto-pause video if playing
  const handleBackToHome = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setView('home');
    setSelectedAnime(null);
    setCharacters([]);
    setRecommendations([]);
    setCinemaMode(false);
  };

  const updateWatchHistory = (anime, epNum) => {
    if (!anime) return;
    setWatchHistory(prev => {
      const existing = prev.filter(item => item.anime.id !== anime.id);
      return [
        {
          anime: {
            id: anime.id,
            title: anime.title,
            image: anime.image,
            episodes: anime.episodes
          },
          lastEpisode: epNum,
          totalEpisodes: anime.episodes,
          timestamp: Date.now()
        },
        ...existing
      ].slice(0, 20); // keep history size reasonable
    });
  };

  const removeFromWatchHistory = (animeId) => {
    setWatchHistory(prev => prev.filter(item => item.anime.id !== animeId));
  };

  const resumeWatch = async (minimalAnime, epNum) => {
    setView('watch');
    setIsLoadingCharacters(true);
    setIsLoadingRecommendations(true);
    setCurrentEpisode(epNum);
    setCinemaMode(false);
    setPlayerMode('overview'); 
    window.scrollTo(0, 0);

    try {
      let fullAnime = minimalAnime;
      if (!minimalAnime.genres || !minimalAnime.synopsis) {
        setIsLoading(true);
        fullAnime = await fetchAnimeDetails(minimalAnime.id);
      }
      setSelectedAnime(fullAnime);

      const [charData, recData] = await Promise.all([
        fetchAnimeCharacters(fullAnime.id),
        fetchAnimeRecommendations(fullAnime.id)
      ]);
      setCharacters(charData);
      setRecommendations(recData);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setIsLoadingCharacters(false);
      setIsLoadingRecommendations(false);
      setIsLoading(false);
    }
  };

  // Load new episode and auto-play
  const selectEpisode = (epNum) => {
    setCurrentEpisode(epNum);
    updateWatchHistory(selectedAnime, epNum);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Auto-play blocked or interrupted:', e));
    }
  };

  // Surprise Me — pick a random anime from the API
  const handleSurprise = async () => {
    try {
      const pick = await fetchRandomAnime();
      if (pick) {
        handleAnimeSelect(pick);
      }
    } catch (e) {
      console.error('Failed to get random anime, falling back to trending', e);
      const pool = trendingAnime.length > 0 ? trendingAnime : [];
      if (pool.length > 0) {
        handleAnimeSelect(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
  };

  return (
    <>
      {cinemaMode && (
        <div className="cinema-backdrop" onClick={() => setCinemaMode(false)}></div>
      )}

      {/* ========================================== */}
      {/* GLOBAL HEADER & SIDEBAR                    */}
      {/* ========================================== */}
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={(e) => {
          if (view !== 'home') setView('home');
          handleSearchSubmit(e);
        }}
        showTrending={() => {
          if (view !== 'home') setView('home');
          showTrending();
        }}
        searchInputRef={searchInputRef}
        theme={theme}
        toggleTheme={toggleTheme}
        karma={karma}
        onSurprise={handleSurprise}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* ========================================== */}
      {/* HOME VIEW (DASHBOARD)                      */}
      {/* ========================================== */}
      {view === 'home' && (
        <>
          <div className="app-layout">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              view={view}
              setView={setView}
              showTrending={showTrending}
            />

            <main className="main-viewport" style={{ 
              marginLeft: cinemaMode ? '0' : undefined
            }}>
              
              {/* Dynamic Featured Billboard Banner (Full Width) */}
              {activeTab === 'trending' && trendingAnime.length > 0 && (
                <FeaturedBillboard
                  animes={trendingAnime.slice(0, 5)}
                  handleAnimeSelect={handleAnimeSelect}
                  toggleWatchlist={toggleWatchlist}
                  isInWatchlist={isInWatchlist}
                />
              )}

              <div className={`dashboard-content ${activeTab !== 'trending' ? 'no-sidebar' : ''}`}>
                
                {/* Main Content Feed (Left Column) */}
                <div className="dashboard-main">
                  {/* Latest Releases Grid */}
                  {!isLoading && !isSearching && !error && activeTab === 'trending' && (
                    <>
                      <ContinueWatching 
                        watchHistory={watchHistory} 
                        resumeWatch={resumeWatch} 
                        removeFromWatchHistory={removeFromWatchHistory}
                      />
                      <LatestReleases 
                        handleAnimeSelect={handleAnimeSelect} 
                        toggleWatchlist={toggleWatchlist}
                        isInWatchlist={isInWatchlist}
                      />
                      <UpcomingReleases 
                        handleAnimeSelect={handleAnimeSelect} 
                        toggleWatchlist={toggleWatchlist}
                        isInWatchlist={isInWatchlist}
                      />
                    </>
                  )}

                  {/* Grid Content Tabs */}
                  <div className="tab-viewport">
                    {(isLoading || isSearching) && (
                      <Loading type="page" message={activeTab === 'schedule' ? 'schedule' : (isSearching ? 'search' : 'data')} />
                    )}

                    {/* Error Block */}
                    {error && !isLoading && !isSearching && activeTab !== 'schedule' && (
                      <div className="error-container">
                        <h3>Something Went Wrong</h3>
                        <div className="error-text">{error}</div>
                        <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={showTrending}>
                          Reset Page
                        </button>
                      </div>
                    )}



                {/* Search Results Grid */}
                {!isLoading && !isSearching && !error && activeTab === 'search' && (
                  <div>
                    <div className="section-header-trilingual">
                      <div className="section-header-trilingual-stack">
                        <span className="section-header-sub-label">खोज और अन्वेषण · 検索</span>
                        <h2 className="section-header-title-main">SEARCH & EXPLORE</h2>
                      </div>
                      <div className="section-header-divider"></div>
                      <span className="nav-link" onClick={showTrending} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                        ◀ BACK TO TRENDING
                      </span>
                    </div>

                    {/* Advanced Search Filters Section */}
                    <div className="filter-section">
                      
                      {/* Page-level Search Input Bar */}
                      <form onSubmit={handleSearchSubmit} className="page-search-row">
                        <div className="page-search-box">
                          <svg className="page-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                          <input
                            type="text"
                            placeholder="Type keywords to search Database..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="page-search-input"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              className="page-search-clear-btn"
                              onClick={handleClearSearch}
                              title="Clear search query"
                            >
                              &#x2715;
                            </button>
                          )}
                        </div>
                        <button type="submit" className="page-search-submit-btn">
                          Search Database
                        </button>
                      </form>

                      <div className="filter-group">
                        <span className="filter-label">Format:</span>
                        <div className="filter-capsules">
                          {formats.map((f) => (
                            <button
                              key={f.value}
                              className={`filter-capsule ${searchFormat === f.value ? 'active' : ''}`}
                              onClick={() => handleFormatChange(f.value)}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <span className="filter-label">Genre:</span>
                        <div className="filter-capsules">
                          {genres.map((g) => (
                            <button
                              key={g.value}
                              className={`filter-capsule ${searchGenre === g.value ? 'active' : ''}`}
                              onClick={() => handleGenreChange(g.value)}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!hasActiveSearchFilters ? (
                      <div className="trending-section" style={{ marginTop: '30px' }}>
                        <div className="section-header-trilingual">
                          <div className="section-header-trilingual-stack">
                            <span className="section-header-sub-label">ट्रेंडिंग · トレンド</span>
                            <h2 className="section-header-title-main">TRENDING NOW</h2>
                          </div>
                          <div className="section-header-divider"></div>
                        </div>

                        <div className={`anime-grid ${isLoadingMore ? 'loading' : ''}`}>
                          {trendingAnime.map((anime, index) => (
                            <AnimeCard
                              key={`${anime.id}-${index}`}
                              anime={anime}
                              handleAnimeSelect={handleAnimeSelect}
                              toggleWatchlist={toggleWatchlist}
                              isInWatchlist={isInWatchlist}
                            />
                          ))}
                        </div>

                        {hasMoreTrending && (
                          <div className="pagination-container">
                            <button 
                              className="btn-load-more" 
                              onClick={handleLoadMoreTrending}
                              disabled={isLoadingMore}
                            >
                              {isLoadingMore ? (
                                <>
                                  <Loading type="inline" size="sm" style={{ marginRight: '8px' }} />
                                  खोज जारी है… · 検索中… · FETCHING SHOWS…
                                </>
                              ) : (
                                "Explore More Trending"
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="error-container">
                        <h3>No Results Found</h3>
                        <div className="error-text">No matching entries recorded in Jikan database. Try modifying your filter combinations.</div>
                      </div>
                    ) : (
                      <>
                        <div className="anime-grid">
                          {searchResults.map((anime, index) => (
                            <AnimeCard
                              key={`${anime.id}-${index}`}
                              anime={anime}
                              handleAnimeSelect={handleAnimeSelect}
                              toggleWatchlist={toggleWatchlist}
                              isInWatchlist={isInWatchlist}
                            />
                          ))}
                        </div>

                        {hasMoreSearch && (
                          <div className="pagination-container">
                            <button 
                              className="btn-load-more" 
                              onClick={handleLoadMoreSearch}
                              disabled={isLoadingMore}
                            >
                              {isLoadingMore ? (
                                <>
                                  <Loading type="inline" size="sm" style={{ marginRight: '8px' }} />
                                  खोज जारी है… · 検索中… · FETCHING SHOWS…
                                </>
                              ) : (
                                "Explore More Results"
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Airing Schedule Grid */}
                {!isLoading && !isSearching && activeTab === 'schedule' && (
                  <div>
                    <div className="section-header-trilingual">
                      <div className="section-header-trilingual-stack">
                        <span className="section-header-sub-label">साप्ताहिक प्रसारण · スケジュール</span>
                        <h2 className="section-header-title-main">WEEKLY AIRING SCHEDULE</h2>
                      </div>
                      <div className="section-header-divider"></div>
                    </div>
                    
                    <ScheduleNav
                      weekdays={weekdays}
                      scheduleDay={scheduleDay}
                      setScheduleDay={setScheduleDay}
                    />
                    
                    {error ? (
                      <div className="error-container">
                        <h3>Failed to Fetch Airing Schedule</h3>
                        <div className="error-text">{error}</div>
                        <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => setScheduleDay(scheduleDay)}>
                          Retry
                        </button>
                      </div>
                    ) : scheduleAnime.length === 0 ? (
                      <div className="error-container">
                        <h3>No Airing Data</h3>
                        <div className="error-text">No scheduled releases recorded for {scheduleDay}.</div>
                      </div>
                    ) : (
                      <div className="anime-grid">
                        {scheduleAnime.map((anime, index) => (
                          <AnimeCard
                            key={`${anime.id}-${index}`}
                            anime={anime}
                            handleAnimeSelect={handleAnimeSelect}
                            toggleWatchlist={toggleWatchlist}
                            isInWatchlist={isInWatchlist}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Watchlist View */}
                {!isLoading && !isSearching && activeTab === 'watchlist' && (
                  <div>
                    <div className="section-header-trilingual">
                      <div className="section-header-trilingual-stack">
                        <span className="section-header-sub-label">मेरी तिजोरी · 保管庫</span>
                        <h2 className="section-header-title-main">MY VAULT</h2>
                      </div>
                      <div className="section-header-divider"></div>
                    </div>

                    {watchlist.length === 0 ? (
                      <WatchlistEmpty 
                        showTrending={showTrending} 
                        onExploreGenres={() => {
                          setSelectedGenreId(null);
                          setActiveTab('genres');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    ) : (
                      <div className="anime-grid">
                        {watchlist.map((anime, index) => (
                          <AnimeCard
                            key={`${anime.id}-${index}`}
                            anime={anime}
                            handleAnimeSelect={handleAnimeSelect}
                            toggleWatchlist={toggleWatchlist}
                            isInWatchlist={isInWatchlist}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Genres Explorer View */}
                {!isLoading && !isSearching && activeTab === 'genres' && (
                  <GenrePage
                    handleAnimeSelect={handleAnimeSelect}
                    toggleWatchlist={toggleWatchlist}
                    isInWatchlist={isInWatchlist}
                    initialGenreId={selectedGenreId}
                    onBackToHub={() => setSelectedGenreId(null)}
                  />
                )}
              </div>
              </div> {/* Close dashboard-main */}

              {/* Right Sidebar Column */}
              {activeTab === 'trending' && (
                <div className="dashboard-sidebar">
                  <TopAnimeSidebar handleAnimeSelect={handleAnimeSelect} />
                </div>
              )}

              </div> {/* Close dashboard-content */}
              {/* Site-wide Footer */}
              <ContentFooter />
            </main>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* NEW DEDICATED DETAILS PAGE                 */}
      {/* ========================================== */}
      {view === 'details' && selectedAnime && (
        <div className="app-layout">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            view={view}
            setView={setView}
            showTrending={showTrending}
          />
          <main className="main-viewport details-viewport" style={{ padding: 0 }}>
            <AnimeDetailsPage
              anime={selectedAnime}
              handleBackToHome={handleBackToHome}
              startWatching={(anime, trailerMode = false) => {
                setSelectedAnime(anime);
                setIsTrailerMode(trailerMode);
                setView('watch');
                if (!trailerMode) {
                  updateWatchHistory(anime, currentEpisode);
                }
                window.scrollTo(0, 0);
              }}
              toggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              characters={characters}
              isLoadingCharacters={isLoadingCharacters}
              recommendations={recommendations}
              isLoadingRecommendations={isLoadingRecommendations}
              onKarmaGain={(amount) => setKarma(k => k + amount)}
              onGenreClick={openGenre}
            />
          </main>
        </div>
      )}

      {/* ========================================== */}
      {/* NEW DEDICATED WATCH PAGE                   */}
      {/* ========================================== */}
      {view === 'watch' && selectedAnime && (() => {
        const historyItem = watchHistory.find(item => item.anime.id === selectedAnime.id);
        const watchedEpisode = historyItem ? historyItem.lastEpisode : 0;
        return (
          <div className="app-layout">
            {!cinemaMode && (
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                view={view}
                setView={setView}
                showTrending={showTrending}
              />
            )}
            <main 
              className="main-viewport watch-viewport" 
              style={{ 
                marginLeft: cinemaMode ? '0' : undefined,
                padding: 0 
              }}
            >
              <AnimeWatchPage
                anime={selectedAnime}
                handleBackToDetails={() => {
                  setView('details');
                  window.scrollTo(0, 0);
                }}
                currentEpisode={currentEpisode}
                selectEpisode={selectEpisode}
                isTrailerMode={isTrailerMode}
                watchedEpisode={watchedEpisode}
                cinemaMode={cinemaMode}
                setCinemaMode={setCinemaMode}
                preferredServer={preferredServer}
                onServerChange={handleServerChange}
              />
            </main>
          </div>
        );
      })()}


      {/* ========================================== */}
      {/* USER AUTH & PROFILE MODAL                  */}
      {/* ========================================== */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogoutSuccess={handleLogoutSuccess}
        currentChoices={{
          watchlist,
          watchHistory,
          karma,
          theme,
          preferredServer
        }}
      />

      {/* ========================================== */}
      {/* FLOATING ATOMIC UX GAINS ELEMENTS         */}
      {/* ========================================== */}
      {showScrollTop && (
        <button 
          className="scroll-to-top-btn" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Scroll to Top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      )}

      <div className={`toast-notification ${toast.visible ? 'visible' : ''}`}>
        {toast.message}
      </div>

    </>
  );
}

export default App;
