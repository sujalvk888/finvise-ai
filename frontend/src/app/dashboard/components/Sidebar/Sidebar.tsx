import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface User {
  id: number;
  name: string;
  email: string;
}

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, onLogout, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <Image src="/logo.png" alt="FinVise.AI Logo" width={32} height={32} />
            <span className={styles.brandName}>FinVise.AI</span>
            <button className={styles.closeBtn} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

        <nav className={styles.nav}>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Dashboard
          </Link>
          <Link 
            href="/watchlist" 
            className={`${styles.navItem} ${pathname === '/watchlist' ? styles.active : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Watchlist
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.active : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </Link>
        </nav>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.userProfileCard}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name || 'Loading...'}</p>
              <p className={styles.userEmail}>{user?.email || 'loading@email.com'}</p>
            </div>
          </div>
          <button onClick={onLogout} className={styles.logoutBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
