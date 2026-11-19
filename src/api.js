const ANILIST_URL = 'https://graphql.anilist.co';

// Simple in-memory cache to prevent duplicate requests
const cache = {
  trending: {},
  search: {},
  characters: {},
  details: {},
  recs: {},
  pictures: {},
  staff: {},
  latest: {},
  upcoming: {}
};

function getStorage(key) {
  try {
    const val = localStorage.getItem('anime_vault_' + key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem('anime_vault_' + key, JSON.stringify(val));
  } catch (e) {
    // ignore quota exceeded
  }
}

/**
 * Executes a GraphQL query against the AniList API.
 * AniList natively supports browser CORS (Access-Control-Allow-Origin: *)
 * and does not require third-party CORS proxies or experience regional ISP blocking.
 */
async function queryAniList(query, variables = {}, signal) {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query, variables }),
    signal
  });

  if (!response.ok) {
    throw new Error(`AniList returned status ${response.status}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'GraphQL query failed');
  }

  return json.data;
}

/**
 * Normalizes AniList media into the standard anime schema expected by the application
 */
function normalizeMedia(media, rank = null) {
  const trailerSite = media.trailer?.site ? media.trailer.site.toLowerCase() : null;
  const trailerId = media.trailer?.id ? String(media.trailer.id) : null;
  let trailerUrl = null;

  if (trailerId) {
    if (trailerSite === 'youtube') {
      trailerUrl = `https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&enablejsapi=1`;
    } else if (trailerSite === 'dailymotion') {
      trailerUrl = `https://www.dailymotion.com/embed/video/${trailerId}?autoplay=1`;
    }
  }

  const score = media.averageScore
    ? (media.averageScore / 10).toFixed(1)
    : (media.meanScore ? (media.meanScore / 10).toFixed(1) : null);

  const cleanSynopsis = media.description
    ? media.description.replace(/<[^>]*>/g, '').trim()
    : 'No synopsis available.';

  return {
    id: media.id,
    idMal: media.idMal || media.id,
    title: media.title?.english || media.title?.romaji || media.title?.native || 'Unknown Title',
    titleJapanese: media.title?.native || media.title?.romaji || '',
    image: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || '',
    bannerImage: media.bannerImage || null,
    score: score ? parseFloat(score) : null,
    episodes: media.episodes || null,
    status: media.status ? media.status.replace(/_/g, ' ') : 'UNKNOWN',
    type: media.format ? (media.format === 'TV_SHORT' ? 'TV' : media.format) : 'TV',
    synopsis: cleanSynopsis,
    genres: media.genres || [],
    trailerUrl: trailerUrl,
    trailerId: trailerId,
    trailerSite: trailerSite,
    rank: rank,
    studio: media.studios?.nodes?.[0]?.name || null,
    source: media.source ? media.source.replace(/_/g, ' ') : null,
    season: media.season ? media.season.toLowerCase() : null,
    year: media.seasonYear || media.startDate?.year || null,
    duration: media.duration ? `${media.duration} min` : null
  };
}

/**
 * Fetch top trending anime
 */
export async function fetchTrending(page = 1) {
  const cacheKey = `page_${page}`;
  if (cache.trending[cacheKey]) {
    return cache.trending[cacheKey];
  }

  const stored = getStorage('trending_' + cacheKey);
  if (stored) {
    cache.trending[cacheKey] = stored;
  }

  try {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            hasNextPage
          }
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            idMal
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            averageScore
            meanScore
            episodes
            status
            format
            description
            genres
            trailer { id site }
            studios(isMain: true) { nodes { name } }
            season
            seasonYear
            startDate { year }
            duration
          }
        }
      }
    `;

    const data = await queryAniList(query, { page });
    const hasNextPage = data.Page?.pageInfo?.hasNextPage || false;
    const results = (data.Page?.media || []).map((m, idx) =>
      normalizeMedia(m, (page - 1) * 20 + idx + 1)
    );

    const output = { results, hasNextPage };
    cache.trending[cacheKey] = output;
    setStorage('trending_' + cacheKey, output);
    return output;
  } catch (error) {
    console.error(`Error fetching trending page ${page}:`, error);
    if (stored) {
      console.info('Serving stored trending data fallback');
      return stored;
    }
    throw error;
  }
}

/**
 * Search and filter anime
 */
export async function searchAnime(query = '', type = '', genreId = '', page = 1) {
  const trimmed = query.trim();
  const cacheKey = `search_${trimmed}_${type}_${genreId}_${page}`;

  if (cache.search[cacheKey]) {
    return cache.search[cacheKey];
  }

  // Genre mapping: accept either Jikan numeric IDs or direct AniList genre strings
  const genreMap = {
    '1': 'Action',
    '2': 'Adventure',
    '4': 'Comedy',
    '8': 'Drama',
    '10': 'Fantasy',
    '24': 'Sci-Fi'
  };

  const selectedGenre = genreMap[genreId] || genreId || null;

  // Format map: tv, movie, ova, special
  const formatMap = {
    'tv': 'TV',
    'movie': 'MOVIE',
    'ova': 'OVA',
    'special': 'SPECIAL'
  };
  const selectedFormat = formatMap[type?.toLowerCase()] || null;

  try {
    const gql = `
      query ($page: Int, $search: String, $format: MediaFormat, $genre: String) {
        Page(page: $page, perPage: 20) {
          pageInfo {
            hasNextPage
          }
          media(search: $search, format: $format, genre: $genre, type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            idMal
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            averageScore
            meanScore
            episodes
            status
            format
            description
            genres
            trailer { id site }
            studios(isMain: true) { nodes { name } }
            season
            seasonYear
            startDate { year }
            duration
          }
        }
      }
    `;

    const variables = { page };
    if (trimmed) variables.search = trimmed;
    if (selectedFormat) variables.format = selectedFormat;
    if (selectedGenre) variables.genre = selectedGenre;

    const data = await queryAniList(gql, variables);
    const hasNextPage = data.Page?.pageInfo?.hasNextPage || false;
    const results = (data.Page?.media || []).map((m) => normalizeMedia(m));

    const output = { results, hasNextPage };
    cache.search[cacheKey] = output;
    return output;
  } catch (error) {
    console.error('Error searching anime:', error);
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch anime for a specific genre with custom sorting, format filters & pagination
 */
export async function fetchAnimeByGenre(genreName, sort = 'popular', format = null, page = 1) {
  if (!cache.genres) cache.genres = {};
  const cacheKey = `genre_${genreName}_${sort}_${format || 'all'}_${page}`;
  if (cache.genres[cacheKey]) {
    return cache.genres[cacheKey];
  }

  const stored = getStorage(cacheKey);
  if (stored) {
    cache.genres[cacheKey] = stored;
  }

  const formatMap = {
    'tv': 'TV',
    'movie': 'MOVIE',
    'ova': 'OVA',
    'special': 'SPECIAL'
  };
  const selectedFormat = format ? formatMap[format.toLowerCase()] : null;

  const sortMap = {
    'popular': ['POPULARITY_DESC', 'SCORE_DESC'],
    'score': ['SCORE_DESC', 'POPULARITY_DESC'],
    'trending': ['TRENDING_DESC'],
    'newest': ['START_DATE_DESC']
  };
  const selectedSort = sortMap[sort] || ['POPULARITY_DESC', 'SCORE_DESC'];

  try {
    const gql = `
      query ($page: Int, $genre: String, $sort: [MediaSort], $format: MediaFormat) {
        Page(page: $page, perPage: 24) {
          pageInfo {
            hasNextPage
            total
          }
          media(genre: $genre, sort: $sort, format: $format, type: ANIME) {
            id
            idMal
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            averageScore
            meanScore
            episodes
            status
            format
            description
            genres
            trailer { id site }
            studios(isMain: true) { nodes { name } }
            season
            seasonYear
            startDate { year }
            duration
          }
        }
      }
    `;

    const variables = { page, genre: genreName, sort: selectedSort };
    if (selectedFormat) variables.format = selectedFormat;

    const data = await queryAniList(gql, variables);
    const hasNextPage = data.Page?.pageInfo?.hasNextPage || false;
    const total = data.Page?.pageInfo?.total || 0;
    const results = (data.Page?.media || []).map((m) => normalizeMedia(m));

    const output = { results, hasNextPage, total };
    cache.genres[cacheKey] = output;
    setStorage(cacheKey, output);
    return output;
  } catch (error) {
    console.error(`Error fetching anime for genre "${genreName}":`, error);
    if (stored) return stored;
    return { results: [], hasNextPage: false, total: 0 };
  }
}

/**
 * Fetch characters for a specific anime
 */
export async function fetchAnimeCharacters(id) {
  const cacheKey = `chars_${id}`;
  if (cache.characters[cacheKey]) {
    return cache.characters[cacheKey];
  }

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          characters(sort: [ROLE, RELEVANCE], perPage: 12) {
            edges {
              role
              node {
                id
                name { full }
                image { large medium }
              }
              voiceActors(language: JAPANESE) {
                name { full }
              }
            }
          }
        }
      }
    `;

    const data = await queryAniList(query, { id: parseInt(id, 10) });
    const edges = data.Media?.characters?.edges || [];

    const results = edges.map((e) => ({
      id: e.node.id,
      name: e.node.name?.full || 'Unknown',
      image: e.node.image?.large || e.node.image?.medium || '',
      role: e.role || 'Supporting',
      voiceActor: e.voiceActors?.[0]?.name?.full || 'Unknown'
    }));

    cache.characters[cacheKey] = results;
    return results;
  } catch (error) {
    console.error(`Error fetching characters for anime ${id}:`, error);
    return [];
  }
}

/**
 * Fetch anime schedules by weekday
 */
export async function fetchSchedule(day, signal) {
  const cacheKey = `schedule_${day}`;
  if (cache.search[cacheKey]) {
    return cache.search[cacheKey];
  }

  try {
    const query = `
      query {
        Page(page: 1, perPage: 25) {
          media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            averageScore
            episodes
            status
            format
            description
            genres
            nextAiringEpisode {
              airingAt
              episode
            }
            studios(isMain: true) { nodes { name } }
            duration
          }
        }
      }
    `;

    const data = await queryAniList(query, {}, signal);
    const results = (data.Page?.media || []).map((m) => {
      let airingTime = 'TBA';
      if (m.nextAiringEpisode?.airingAt) {
        const d = new Date(m.nextAiringEpisode.airingAt * 1000);
        airingTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return {
        ...normalizeMedia(m),
        airingTime
      };
    });

    cache.search[cacheKey] = results;
    return results;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error(`Error fetching schedule for ${day}:`, error);
    return [];
  }
}

/**
 * Fetch full details for a single anime
 */
export async function fetchAnimeDetails(id) {
  const cacheKey = `details_${id}`;
  if (cache.details[cacheKey]) {
    return cache.details[cacheKey];
  }

  const stored = getStorage(cacheKey);
  if (stored) {
    cache.details[cacheKey] = stored;
  }

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          id
          idMal
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          averageScore
          meanScore
          episodes
          status
          format
          description
          genres
          trailer { id site }
          studios(isMain: true) { nodes { name } }
          season
          seasonYear
          startDate { year }
          duration
        }
      }
    `;

    const data = await queryAniList(query, { id: parseInt(id, 10) });
    if (!data.Media) {
      throw new Error('Anime not found');
    }

    const result = normalizeMedia(data.Media);
    cache.details[cacheKey] = result;
    setStorage(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error fetching details for anime ${id}:`, error);
    if (stored) return stored;
    throw error;
  }
}

/**
 * Fetch recommendations for a specific anime
 */
export async function fetchAnimeRecommendations(id) {
  const cacheKey = `recs_${id}`;
  if (cache.recs[cacheKey]) {
    return cache.recs[cacheKey];
  }

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          recommendations(perPage: 10, sort: RATING_DESC) {
            nodes {
              rating
              mediaRecommendation {
                id
                title { english romaji }
                coverImage { extraLarge large medium }
              }
            }
          }
        }
      }
    `;

    const data = await queryAniList(query, { id: parseInt(id, 10) });
    const nodes = data.Media?.recommendations?.nodes || [];

    const results = nodes
      .filter((n) => n.mediaRecommendation)
      .map((n) => ({
        id: n.mediaRecommendation.id,
        title: n.mediaRecommendation.title?.english || n.mediaRecommendation.title?.romaji || 'Unknown',
        image: n.mediaRecommendation.coverImage?.extraLarge || n.mediaRecommendation.coverImage?.large || '',
        votes: n.rating || 10
      }));

    cache.recs[cacheKey] = results;
    return results;
  } catch (error) {
    console.error(`Error fetching recommendations for anime ${id}:`, error);
    return [];
  }
}

/**
 * Fetch promotional pictures/screenshots for a specific anime
 */
export async function fetchAnimePictures(id) {
  const cacheKey = `pics_${id}`;
  if (cache.pictures[cacheKey]) {
    return cache.pictures[cacheKey];
  }

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          bannerImage
          coverImage { extraLarge large }
        }
      }
    `;

    const data = await queryAniList(query, { id: parseInt(id, 10) });
    const pics = [];
    if (data.Media?.bannerImage) pics.push(data.Media.bannerImage);
    if (data.Media?.coverImage?.extraLarge) pics.push(data.Media.coverImage.extraLarge);
    if (data.Media?.coverImage?.large) pics.push(data.Media.coverImage.large);

    cache.pictures[cacheKey] = pics;
    return pics;
  } catch (error) {
    console.error(`Error fetching pictures for anime ${id}:`, error);
    return [];
  }
}

/**
 * Fetch staff/creators for a specific anime
 */
export async function fetchAnimeStaff(id) {
  const cacheKey = `staff_${id}`;
  if (cache.staff[cacheKey]) {
    return cache.staff[cacheKey];
  }

  try {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          staff(perPage: 6, sort: RELEVANCE) {
            edges {
              role
              node {
                id
                name { full }
                image { large medium }
              }
            }
          }
        }
      }
    `;

    const data = await queryAniList(query, { id: parseInt(id, 10) });
    const edges = data.Media?.staff?.edges || [];

    const results = edges.map((e) => ({
      id: e.node.id,
      name: e.node.name?.full || 'Unknown',
      image: e.node.image?.large || e.node.image?.medium || '',
      positions: [e.role || 'Staff']
    }));

    cache.staff[cacheKey] = results;
    return results;
  } catch (error) {
    console.error(`Error fetching staff for anime ${id}:`, error);
    return [];
  }
}

/**
 * Fetch latest released anime (currently airing)
 */
export async function fetchLatestReleases(page = 1) {
  const cacheKey = `latest_releases_${page}`;
  if (cache.latest[cacheKey]) {
    return cache.latest[cacheKey];
  }

  const stored = getStorage(cacheKey);
  if (stored) {
    cache.latest[cacheKey] = stored;
  }

  try {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 18) {
          pageInfo {
            hasNextPage
          }
          media(status: RELEASING, sort: START_DATE_DESC, type: ANIME) {
            id
            idMal
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            averageScore
            meanScore
            episodes
            status
            format
            description
            genres
            trailer { id site }
            studios(isMain: true) { nodes { name } }
            season
            seasonYear
            startDate { year }
            duration
          }
        }
      }
    `;

    const data = await queryAniList(query, { page });
    const hasNextPage = data.Page?.pageInfo?.hasNextPage || false;
    const results = (data.Page?.media || []).map((m) => normalizeMedia(m));

    const output = { results, hasNextPage };
    cache.latest[cacheKey] = output;
    setStorage(cacheKey, output);
    return output;
  } catch (error) {
    console.error(`Error fetching latest releases page ${page}:`, error);
    if (stored) return stored;
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch upcoming anime releases
 */
export async function fetchUpcomingReleases(page = 1) {
  const cacheKey = `upcoming_releases_${page}`;
  if (cache.upcoming[cacheKey]) {
    return cache.upcoming[cacheKey];
  }

  const stored = getStorage(cacheKey);
  if (stored) {
    cache.upcoming[cacheKey] = stored;
  }

  try {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 18) {
          pageInfo {
            hasNextPage
          }
          media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: ANIME) {
            id
            idMal
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            averageScore
            meanScore
            episodes
            status
            format
            description
            genres
            trailer { id site }
            studios(isMain: true) { nodes { name } }
            season
            seasonYear
            startDate { year }
            duration
          }
        }
      }
    `;

    const data = await queryAniList(query, { page });
    const hasNextPage = data.Page?.pageInfo?.hasNextPage || false;
    const results = (data.Page?.media || []).map((m) => normalizeMedia(m));

    const output = { results, hasNextPage };
    cache.upcoming[cacheKey] = output;
    setStorage(cacheKey, output);
    return output;
  } catch (error) {
    console.error(`Error fetching upcoming releases page ${page}:`, error);
    if (stored) return stored;
    return { results: [], hasNextPage: false };
  }
}

/**
 * Fetch Top Anime for Sidebar
 */
export async function fetchTopAnime(filter = '') {
  const cacheKey = `top_anime_${filter}`;
  if (cache.trending[cacheKey]) {
    return cache.trending[cacheKey];
  }

  const stored = getStorage(cacheKey);
  if (stored) {
    cache.trending[cacheKey] = stored;
  }

  try {
    let sortVal = 'SCORE_DESC';
    if (filter === 'bypopularity') sortVal = 'POPULARITY_DESC';
    if (filter === 'favorite') sortVal = 'FAVOURITES_DESC';

    const query = `
      query ($sort: [MediaSort]) {
        Page(page: 1, perPage: 10) {
          media(sort: $sort, type: ANIME) {
            id
            title { romaji english native }
            coverImage { extraLarge large medium }
            averageScore
            format
            episodes
          }
        }
      }
    `;

    const data = await queryAniList(query, { sort: [sortVal] });
    const results = (data.Page?.media || []).map((anime, index) => ({
      id: anime.id,
      title: anime.title?.english || anime.title?.romaji || 'Unknown Title',
      image: anime.coverImage?.large || anime.coverImage?.medium || '',
      score: anime.averageScore ? parseFloat((anime.averageScore / 10).toFixed(1)) : 8.0,
      type: anime.format || 'TV',
      episodes: anime.episodes,
      rank: index + 1
    }));

    cache.trending[cacheKey] = results;
    setStorage(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    if (stored) return stored;
    return [];
  }
}

/**
 * Fetch a completely random anime
 */
export async function fetchRandomAnime() {
  try {
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 1) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title { romaji english native }
            coverImage { extraLarge large medium }
            bannerImage
            averageScore
            episodes
            status
            format
            description
            genres
            trailer { id site }
            studios(isMain: true) { nodes { name } }
            season
            seasonYear
            startDate { year }
            duration
          }
        }
      }
    `;

    const data = await queryAniList(query, { page: randomPage });
    const media = data.Page?.media?.[0];
    if (media) {
      return normalizeMedia(media);
    }
    return null;
  } catch (error) {
    console.error('Error fetching random anime:', error);
    return null;
  }
}
