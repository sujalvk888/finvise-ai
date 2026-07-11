'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import { useAiEngine, AiEngine } from '../context/AiEngineContext';
import styles from './page.module.css';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const { engine, setEngine } = useAiEngine();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        setDisplayName(u.name || '');
      }
      setIsLoading(false);
    });
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleNameSave = async () => {
    if (!displayName.trim() || displayName === user?.name) return;
    
    try {
      setIsSaving(true);
      const updatedUser = await authService.updateUser({ name: displayName });
      setUser(updatedUser);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update name', err);
      alert('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEngineChange = (selected: AiEngine) => {
    setEngine(selected);
  };

  const initials = (displayName || user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage your profile and AI engine preferences.</p>
      </div>

      {/* User Profile Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleArea}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ab6da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h2 className={styles.cardTitle}>User Profile</h2>
          </div>
        </div>

        <div className={styles.profileSection}>
          <div className={styles.avatarCircle}>
            {initials}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{user?.name || '—'}</div>
            <div className={styles.profileEmail}>{user?.email || '—'}</div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="display-name">Display Name</label>
          <div className={styles.fieldRow}>
            <input
              id="display-name"
              type="text"
              className={styles.textInput}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
            <button 
              className={styles.saveBtn} 
              onClick={handleNameSave}
              disabled={isSaving || !displayName.trim() || displayName === user?.name}
              style={{ opacity: (isSaving || !displayName.trim() || displayName === user?.name) ? 0.7 : 1 }}
            >
              {isSaving ? 'Saving...' : nameSaved ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Saved
                </>
              ) : 'Save'}
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email Address</label>
          <div className={styles.staticField}>{user?.email || '—'}</div>
          <p className={styles.fieldHint}>Email cannot be changed from this page.</p>
        </div>
      </div>

      {/* AI Engine Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleArea}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ab6da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <line x1="8" y1="16" x2="8" y2="16"></line>
              <line x1="16" y1="16" x2="16" y2="16"></line>
            </svg>
            <h2 className={styles.cardTitle}>AI Engine</h2>
          </div>
          <div className={styles.activeEnginePill}>
            Active: <strong>{engine === 'groq' ? 'Groq' : 'Ollama'}</strong>
          </div>
        </div>
        <p className={styles.cardDescription}>
          Select the AI engine used to generate financial analysis reports. The selected engine will be reflected immediately in the dashboard header and advisory panel.
        </p>

        <div className={styles.engineGrid}>
          {/* Groq Option */}
          <button
            className={`${styles.engineTile} ${engine === 'groq' ? styles.engineTileActive : ''}`}
            onClick={() => handleEngineChange('groq')}
          >
            <div className={styles.engineTileHeader}>
              <div className={styles.engineIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className={styles.engineRadio}>
                {engine === 'groq' && <div className={styles.engineRadioDot}></div>}
              </div>
            </div>
            <div className={styles.engineName}>Groq</div>
            <div className={styles.engineTag}>Cloud AI</div>
            <ul className={styles.engineFeatures}>
              <li>⚡ Fast inference</li>
              <li>🧠 Llama 3.3 70B model</li>
              <li>☁️ Requires internet</li>
              <li>🎯 Higher reasoning quality</li>
            </ul>
          </button>

          {/* Ollama Option */}
          <button
            className={`${styles.engineTile} ${engine === 'ollama' ? styles.engineTileActive : ''}`}
            onClick={() => handleEngineChange('ollama')}
          >
            <div className={styles.engineTileHeader}>
              <div className={styles.engineIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div className={styles.engineRadio}>
                {engine === 'ollama' && <div className={styles.engineRadioDot}></div>}
              </div>
            </div>
            <div className={styles.engineName}>Ollama</div>
            <div className={styles.engineTag}>Local AI</div>
            <ul className={styles.engineFeatures}>
              <li>🔒 Runs on your computer</li>
              <li>🤖 phi3:mini model</li>
              <li>📴 Works offline</li>
              <li>🛠️ Ideal for development</li>
            </ul>
          </button>
        </div>

        {engine === 'ollama' && (
          <div className={styles.ollamaNotice}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>
              Make sure Ollama is running locally: <code>ollama serve</code> and the model is downloaded: <code>ollama pull phi3:mini</code>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
