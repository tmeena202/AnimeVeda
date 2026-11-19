import '../styles/ContentFooter.css';

export default function ContentFooter() {
  return (
    <footer className="content-footer" id="site-footer">
      <div className="footer-top-row">
        <div className="footer-brand">
          <div className="footer-brand-name">
            ANIME<span>VAULT</span>
          </div>
          <div className="footer-brand-tagline">
            Explore the multiverse of anime
          </div>
        </div>

        <div className="footer-shortcuts">
          <div className="footer-shortcut">
            <kbd>/</kbd> Search
          </div>
          <div className="footer-shortcut">
            <kbd>ESC</kbd> Exit Theater
          </div>
        </div>
      </div>

      <div className="footer-bottom-row">
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} Anime Veda. All rights reserved.
        </div>
        <div className="footer-api-credit">
          Powered by{' '}
          <a href="https://jikan.moe" target="_blank" rel="noopener noreferrer">
            Jikan API v4
          </a>
          {' '}— MyAnimeList unofficial API
        </div>
      </div>
    </footer>
  );
}
