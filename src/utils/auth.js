// ========================================================
// USER AUTH & PROFILE PERSISTENCE UTILITY
// ========================================================

const USERS_KEY = 'anime_veda_users';
const CURRENT_USER_KEY = 'anime_veda_current_user';
const GUEST_DATA_KEY = 'anime_veda_guest_data';

export const AVATAR_PRESETS = [
  { id: 'kitsune', label: 'Kitsune', icon: '🦊', aura: '240, 145, 62' },
  { id: 'samurai', label: 'Samurai', icon: '⚔️', aura: '224, 64, 64' },
  { id: 'shinobi', label: 'Shinobi', icon: '🎭', aura: '139, 92, 246' },
  { id: 'dragon', label: 'Ryu Dragon', icon: '🐉', aura: '34, 197, 94' },
  { id: 'lightning', label: 'Raikiri', icon: '⚡', aura: '234, 179, 8' },
  { id: 'sakura', label: 'Sakura', icon: '🌸', aura: '244, 114, 182' },
  { id: 'monarch', label: 'Monarch', icon: '👑', aura: '251, 191, 36' },
  { id: 'astral', label: 'Void Walker', icon: '🌌', aura: '99, 102, 241' },
  { id: 'oni', label: 'Oni', icon: '👹', aura: '239, 68, 68' },
  { id: 'mecha', label: 'Mecha Pilot', icon: '🤖', aura: '14, 165, 233' },
];

export const getKarmaRank = (karma = 0) => {
  if (karma >= 500) return { title: 'HOKAGE · 頂点', tier: 'Ascendant', color: 'var(--accent-score)' };
  if (karma >= 250) return { title: 'JONIN · 上忍', tier: 'Master', color: 'var(--accent-primary)' };
  if (karma >= 100) return { title: 'CHUNIN · 中忍', tier: 'Adept', color: 'var(--accent-tertiary)' };
  return { title: 'GENIN · 下忍', tier: 'Novice', color: 'var(--text-secondary)' };
};

// Get all registered users dictionary { [userId]: userObject }
export const getAllUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load users from localStorage:', err);
    return {};
  }
};

const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage:', err);
  }
};

// Get currently logged-in user profile
export const getCurrentUser = () => {
  try {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    const users = getAllUsers();
    return users[userId] || null;
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
};

// Get guest fallback data
export const getGuestData = () => {
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY);
    if (raw) return JSON.parse(raw);
    
    // Check legacy storage keys for smooth backward compatibility
    const legacyWatchlist = localStorage.getItem('watchlist');
    const legacyHistory = localStorage.getItem('watch_history');
    const legacyKarma = localStorage.getItem('anime_karma');
    const legacyTheme = localStorage.getItem('theme');

    return {
      watchlist: legacyWatchlist ? JSON.parse(legacyWatchlist) : [],
      watchHistory: legacyHistory ? JSON.parse(legacyHistory) : [],
      karma: legacyKarma ? parseInt(legacyKarma, 10) : 0,
      theme: legacyTheme || 'dark',
    };
  } catch (err) {
    return {
      watchlist: [],
      watchHistory: [],
      karma: 0,
      theme: 'dark',
    };
  }
};

export const saveGuestData = (data) => {
  try {
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save guest data:', err);
  }
};

// Save updates to current user's personal choices
export const saveCurrentUserData = (updates) => {
  const current = getCurrentUser();
  if (current) {
    const users = getAllUsers();
    users[current.id] = {
      ...current,
      data: {
        ...current.data,
        ...updates,
      },
      updatedAt: Date.now(),
    };
    saveUsers(users);
  } else {
    // If guest, update guest data
    const guestData = getGuestData();
    saveGuestData({
      ...guestData,
      ...updates,
    });
  }
};

// Sign Up new user
export const registerUser = ({ username, password, avatar, initialChoices }) => {
  const trimmed = username.trim();
  if (!trimmed || trimmed.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }

  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  const users = getAllUsers();
  const lower = trimmed.toLowerCase();
  const exists = Object.values(users).some(u => u.username.toLowerCase() === lower);
  if (exists) {
    throw new Error(`Username "${trimmed}" is already registered. Please choose another or log in.`);
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser = {
    id: userId,
    username: trimmed,
    password, // Stored for client-side multi-user demonstration
    avatar: avatar || '🦊',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: {
      watchlist: initialChoices?.watchlist || [],
      watchHistory: initialChoices?.watchHistory || [],
      karma: initialChoices?.karma ?? 25, // +25 bonus karma on sign up!
      theme: initialChoices?.theme || 'dark',
      preferredServer: initialChoices?.preferredServer || 'anixo',
    },
  };

  users[userId] = newUser;
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, userId);

  return newUser;
};

// Log In user
export const loginUser = ({ username, password }) => {
  const trimmed = username.trim();
  const users = getAllUsers();
  const lower = trimmed.toLowerCase();
  
  const user = Object.values(users).find(u => u.username.toLowerCase() === lower);
  if (!user) {
    throw new Error(`No account found with username "${trimmed}".`);
  }

  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
};

// Switch directly to another saved user
export const switchUser = (userId) => {
  const users = getAllUsers();
  const user = users[userId];
  if (!user) throw new Error('User profile not found.');
  localStorage.setItem(CURRENT_USER_KEY, userId);
  return user;
};

// Log Out current user
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Delete a user profile
export const deleteUser = (userId) => {
  const users = getAllUsers();
  delete users[userId];
  saveUsers(users);
  if (localStorage.getItem(CURRENT_USER_KEY) === userId) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
