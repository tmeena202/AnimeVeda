import React from 'react';
import '../styles/Loading.css';

const TEXT_PRESETS = {
  data: {
    ja: '読み込み中…',
    en: 'RETRIEVING DATA…'
  },
  cast: {
    ja: '検索中…',
    en: 'RETRIEVING CAST DATA…'
  },
  recs: {
    ja: '類似作品を分析中…',
    en: 'ANALYZING SIMILARITY…'
  },
  releases: {
    ja: '新着情報取得中…',
    en: 'RETRIEVING LATEST RELEASES…'
  },
  search: {
    ja: 'データベース検索中…',
    en: 'SEARCHING DATABASE…'
  },
  schedule: {
    ja: '番組表を読み込み中…',
    en: 'RETRIEVING SCHEDULE…'
  }
};

export default function Loading({ 
  type = 'section', // 'page' | 'section' | 'overlay' | 'inline'
  size = null,      // 'lg' | 'md' | 'sm' (null uses preset default)
  message = null,   // preset key ('data', 'cast', etc.) or string or element
  style = {} 
}) {
  // Determine spinner size based on loading type if not explicitly set
  const spinnerSize = size || (type === 'page' ? 'lg' : type === 'inline' ? 'sm' : 'md');

  // Resolve trilingual message
  let displayMessage = null;
  if (message) {
    if (TEXT_PRESETS[message]) {
      const preset = TEXT_PRESETS[message];
      displayMessage = (
        <span className="trilingual-loading-text">
          <span className="lang-ja">{preset.ja}</span>
          <span className="divider">·</span>
          <span className="lang-en">{preset.en}</span>
        </span>
      );
    } else {
      displayMessage = message;
    }
  }

  const containerClass = `loading-component loading-${type}`;
  const spinnerClass = `spinner ${spinnerSize}`;

  return (
    <div className={containerClass} style={style}>
      <div className={spinnerClass}></div>
      {displayMessage && (
        <div className="loading-text">
          {displayMessage}
        </div>
      )}
    </div>
  );
}
