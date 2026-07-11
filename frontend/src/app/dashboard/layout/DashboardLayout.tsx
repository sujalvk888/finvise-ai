'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { authService } from '@/services/auth';
import { SearchProvider, useSearch } from '../context/SearchContext';
import { AiEngineProvider } from '../context/AiEngineContext';
import { WatchlistProvider } from '../context/WatchlistContext';
import { DashboardProvider } from '../context/DashboardContext';
import styles from './DashboardLayout.module.css';

interface User {
  id: number;
  name: string;
  email: string;
}

// Inner component so it can consume SearchContext
function DashboardInner({ children, user, onLogout }: {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}) {
  const { ticker, setTicker, onAnalyze, loading } = useSearch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar user={user} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.mainWrapper}>
        <Header
          ticker={ticker}
          onTickerChange={setTicker}
          onAnalyze={onAnalyze}
          loading={loading}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.replace('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.replace('/login');
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading Dashboard...</div>;
  }

  if (!user) return null;

  return (
    <AiEngineProvider>
      <SearchProvider>
        <DashboardProvider>
          <WatchlistProvider>
            <DashboardInner user={user} onLogout={handleLogout}>
              {children}
            </DashboardInner>
          </WatchlistProvider>
        </DashboardProvider>
      </SearchProvider>
    </AiEngineProvider>
  );
}
