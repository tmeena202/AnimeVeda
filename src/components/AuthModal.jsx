import { useState, useEffect, useRef } from 'react';
import { X, User, Lock, Sparkles, LogIn, UserPlus, LogOut, Users, Shield, Check, Trash2 } from 'lucide-react';
import { 
  AVATAR_PRESETS, 
  getKarmaRank, 
  getAllUsers, 
  loginUser, 
  registerUser, 
  switchUser,
  deleteUser
} from '../utils/auth';
import '../styles/AuthModal.css';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogoutSuccess,
  currentChoices,
}) {
  const [activeTab, setActiveTab] = useState(currentUser ? 'profile' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].icon);
  const [importChoices, setImportChoices] = useState(true);
  const [error, setError] = useState(null);
  const [savedUsers, setSavedUsers] = useState({});

  const usernameInputRef = useRef(null);

  // Sync state whenever modal opens or current user changes
  useEffect(() => {
    if (isOpen) {
      setSavedUsers(getAllUsers());
      setError(null);
      setUsername('');
      setPassword('');
      if (currentUser) {
        setActiveTab('profile');
      } else {
        setActiveTab('login');
      }
      setTimeout(() => {
        if (usernameInputRef.current) {
          usernameInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, currentUser]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = loginUser({ username, password });
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError(null);
    try {
      const initialChoices = importChoices ? currentChoices : {
        watchlist: [],
        watchHistory: [],
        karma: 25,
        theme: 'dark'
      };
      const user = registerUser({
        username,
        password,
        avatar: selectedAvatar,
        initialChoices
      });
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register account.');
    }
  };

  const handleDirectSwitch = (userId) => {
    setError(null);
    try {
      const user = switchUser(userId);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to switch user.');
    }
  };

  const handleDeleteAccount = (userId, name) => {
    if (window.confirm(`Are you sure you want to delete profile "${name}"? This cannot be undone.`)) {
      deleteUser(userId);
      const updated = getAllUsers();
      setSavedUsers(updated);
      if (currentUser && currentUser.id === userId) {
        onLogoutSuccess();
        setActiveTab('login');
      }
    }
  };

  const userList = Object.values(savedUsers);
  const otherUsers = currentUser ? userList.filter(u => u.id !== currentUser.id) : userList;

  const karmaRank = currentUser ? getKarmaRank(currentChoices?.karma || 0) : null;
  const vaultCount = currentChoices?.watchlist?.length || 0;
  const historyCount = currentChoices?.watchHistory?.length || 0;

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose} title="Close (Esc)">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <span className="auth-header-sub">アカウント · USER PROFILE SYSTEM</span>
          <h2 className="auth-header-title">
            <Sparkles size={20} color="var(--accent-primary)" />
            {activeTab === 'profile' ? 'Profile & Preferences' : (activeTab === 'login' ? 'Sign In to Anime Veda' : 'Create Anime Profile')}
          </h2>
        </div>

        {/* Mode: Logged In User Profile View */}
        {activeTab === 'profile' && currentUser && (
          <div className="profile-card-body">
            
            {/* Identity Hero */}
            <div className="profile-hero-section">
              <div className="profile-avatar-large">
                {currentUser.avatar || '🦊'}
              </div>
              <div className="profile-identity-stack">
                <h3 className="profile-name-title">{currentUser.username}</h3>
                <div className="profile-rank-badge" style={{ color: karmaRank?.color }}>
                  <Shield size={12} />
                  <span>{karmaRank?.title}</span>
                </div>
              </div>
            </div>

            {/* User Stats Matrix */}
            <div className="profile-stats-grid">
              <div className="profile-stat-box">
                <span className="profile-stat-label">Vault List</span>
                <span className="profile-stat-value">{vaultCount}</span>
              </div>
              <div className="profile-stat-box">
                <span className="profile-stat-label">Watched</span>
                <span className="profile-stat-value">{historyCount}</span>
              </div>
              <div className="profile-stat-box">
                <span className="profile-stat-label">Karma</span>
                <span className="profile-stat-value karma">{currentChoices?.karma || 0}</span>
              </div>
            </div>

            {/* Saved User Choices Status */}
            <div className="profile-choices-summary">
              <div className="profile-choice-row">
                <span className="profile-choice-key">Theme Preference</span>
                <span className="profile-choice-val">{currentChoices?.theme || 'dark'}</span>
              </div>
              <div className="profile-choice-row">
                <span className="profile-choice-key">Account Status</span>
                <span className="profile-choice-val" style={{ color: 'var(--accent-score)' }}>Active & Synced</span>
              </div>
              <div className="profile-choice-row">
                <span className="profile-choice-key">Member Since</span>
                <span className="profile-choice-val">
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>

            {/* Actions: Logout & Switch */}
            <div className="profile-action-group">
              <button 
                type="button" 
                className="profile-btn-logout"
                onClick={() => {
                  onLogoutSuccess();
                  onClose();
                }}
              >
                <LogOut size={15} />
                Log Out
              </button>

              <button 
                type="button" 
                className="profile-btn-switch"
                onClick={() => setActiveTab('switch')}
              >
                <Users size={15} />
                Switch Account
              </button>
            </div>

          </div>
        )}

        {/* Mode: Account Switching View */}
        {activeTab === 'switch' && (
          <div className="auth-quick-switch-section" style={{ borderTop: 'none', padding: '24px 28px' }}>
            <div className="auth-quick-title">
              <span>Switch to Saved Profile</span>
              <button 
                type="button" 
                onClick={() => setActiveTab(currentUser ? 'profile' : 'login')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
              >
                &larr; Back
              </button>
            </div>

            {otherUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No other accounts saved on this device.
              </div>
            ) : (
              <div className="auth-users-list">
                {otherUsers.map(user => (
                  <div key={user.id} className="auth-user-row" onClick={() => handleDirectSwitch(user.id)}>
                    <div className="auth-user-row-info">
                      <span className="auth-user-row-avatar">{user.avatar}</span>
                      <div>
                        <div className="auth-user-row-name">{user.username}</div>
                        <div className="auth-user-row-meta">
                          Karma: {user.data?.karma ?? 0} · Vault: {user.data?.watchlist?.length || 0}
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(user.id, user.username);
                      }}
                      title="Remove profile from device"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="auth-submit-btn" 
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                onClick={() => setActiveTab('login')}
              >
                <LogIn size={15} />
                Sign in New Account
              </button>
              <button 
                type="button" 
                className="auth-submit-btn" 
                onClick={() => setActiveTab('signup')}
              >
                <UserPlus size={15} />
                Create New Profile
              </button>
            </div>
          </div>
        )}

        {/* Mode: Login or Sign Up Forms */}
        {(activeTab === 'login' || activeTab === 'signup') && (
          <>
            {/* Tab Bar */}
            <div className="auth-tab-bar">
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setError(null); }}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setError(null); }}
              >
                <UserPlus size={15} />
                Create Account
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={activeTab === 'login' ? handleLoginSubmit : handleSignupSubmit} 
              className="auth-form"
            >
              {error && (
                <div className="auth-error-banner">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="auth-field-group">
                <label className="auth-field-label">Username</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    ref={usernameInputRef}
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Kakashi, Zoro, Tanjiro"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={24}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Min. 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              {/* Sign Up Avatar Selection Grid */}
              {activeTab === 'signup' && (
                <div className="auth-field-group">
                  <label className="auth-field-label">Choose Anime Avatar</label>
                  <div className="auth-avatar-grid">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`auth-avatar-option ${selectedAvatar === preset.icon ? 'selected' : ''}`}
                        onClick={() => setSelectedAvatar(preset.icon)}
                      >
                        <span className="auth-avatar-icon">{preset.icon}</span>
                        <span className="auth-avatar-name">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sign Up Import Choices Checkbox */}
              {activeTab === 'signup' && (
                <label className="auth-checkbox-row">
                  <input
                    type="checkbox"
                    checked={importChoices}
                    onChange={(e) => setImportChoices(e.target.checked)}
                  />
                  <span>
                    Remember & import current Watchlist ({vaultCount}), History ({historyCount}), and Karma into this account
                  </span>
                </label>
              )}

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn">
                {activeTab === 'login' ? (
                  <>
                    <LogIn size={16} />
                    <span>Sign In & Restore Choices</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create Profile (+25 Karma)</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Switch section for saved users if any exist */}
            {userList.length > 0 && activeTab === 'login' && (
              <div className="auth-quick-switch-section">
                <div className="auth-quick-title">
                  <span>Saved Profiles on this device</span>
                  <span style={{ fontSize: '10px' }}>1-Tap Sign In</span>
                </div>
                <div className="auth-users-list">
                  {userList.map(user => (
                    <div 
                      key={user.id} 
                      className="auth-user-row" 
                      onClick={() => handleDirectSwitch(user.id)}
                    >
                      <div className="auth-user-row-info">
                        <span className="auth-user-row-avatar">{user.avatar}</span>
                        <div>
                          <div className="auth-user-row-name">{user.username}</div>
                          <div className="auth-user-row-meta">
                            Vault: {user.data?.watchlist?.length || 0} · Karma: {user.data?.karma ?? 0}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                        Select &rarr;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
