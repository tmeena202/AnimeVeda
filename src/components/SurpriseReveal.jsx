import { useEffect, useState } from 'react';
import '../styles/SurpriseReveal.css';

const COUNTDOWN_KANJI = ['三', '二', '一']; // 3, 2, 1 in Japanese

export default function SurpriseReveal({ anime, onComplete }) {
  const [phase, setPhase] = useState('spin');     // spin → countdown → slam → done
  const [countIdx, setCountIdx] = useState(0);

  useEffect(() => {
    // Phase 1: Spinning Ensō (800ms)
    const t1 = setTimeout(() => setPhase('countdown'), 800);

    // Phase 2: 3 → 2 → 1 kanji countdown (300ms each)
    const t2 = setTimeout(() => setCountIdx(0), 800);
    const t3 = setTimeout(() => setCountIdx(1), 1100);
    const t4 = setTimeout(() => setCountIdx(2), 1400);

    // Phase 3: Poster slam-reveal
    const t5 = setTimeout(() => setPhase('slam'), 1700);

    // Phase 4: Auto-complete into detail page
    const t6 = setTimeout(() => onComplete(), 3200);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`surprise-overlay phase-${phase}`} onClick={phase === 'slam' ? onComplete : undefined}>

      {/* Background radial burst */}
      <div className="surprise-radial-burst" />

      {/* Shoji grid pattern */}
      <div className="surprise-shoji" />

      {/* Phase: spin — spinning Ensō */}
      {phase === 'spin' && (
        <div className="surprise-enso-wrapper">
          <div className="surprise-enso" />
          <span className="surprise-fate-jp">運命</span>
        </div>
      )}

      {/* Phase: countdown — kanji numerals */}
      {phase === 'countdown' && (
        <div className="surprise-countdown">
          <span key={countIdx} className="surprise-countdown-char">{COUNTDOWN_KANJI[countIdx]}</span>
          <span className="surprise-fate-label">運命を引く · DRAWING YOUR FATE</span>
        </div>
      )}

      {/* Phase: slam — full poster reveal */}
      {phase === 'slam' && anime && (
        <div className="surprise-slam">
          <div className="surprise-slam-left">
            <div className="surprise-slam-tag">運命の選択 · FATE HAS CHOSEN</div>
            <h1 className="surprise-slam-title">{anime.title}</h1>
            {anime.titleJapanese && (
              <div className="surprise-slam-jp">{anime.titleJapanese}</div>
            )}
            <div className="surprise-slam-meta">
              {anime.score && <span className="surprise-meta-pill">★ {anime.score.toFixed(1)}</span>}
              {anime.type && <span className="surprise-meta-pill">{anime.type}</span>}
              {anime.year && <span className="surprise-meta-pill">{anime.year}</span>}
            </div>
            <div className="surprise-slam-genres">
              {(anime.genres || []).slice(0, 3).join(' · ')}
            </div>
            <p className="surprise-slam-synopsis">{(anime.synopsis || '').slice(0, 160)}…</p>
            <button className="surprise-slam-cta" onClick={onComplete}>
              ▶ 今すぐ見る · OPEN NOW
            </button>
          </div>

          <div className="surprise-slam-right">
            <div className="surprise-poster-frame">
              <img src={anime.image} alt={anime.title} className="surprise-poster-img" />
              <div className="surprise-poster-overlay" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
