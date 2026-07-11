"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLaunchApp = () => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className={styles.main}>


      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="FinVise.AI Logo" width={32} height={32} />
          <div>FinVise.AI <span className={styles.tagline}>AI Financial Advisor</span></div>
        </div>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#info" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#capabilities" onClick={() => setMenuOpen(false)}>Technology</a>
          <a href="#capabilities" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <div className={styles.headerActions}>
          <button className={styles.applyBtn} onClick={handleLaunchApp}>Launch App</button>
          <button className={styles.hamburger} aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1><span className={styles.nowrap}>INSTITUTIONAL-GRADE</span><br/>STOCK ANALYSIS<br/>POWERED BY AI</h1>
          <p className={styles.heroDescription}>
            Analyze any public company using real-time market data, AI-powered insights, and interactive financial visualizations—all from one intelligent platform.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.btnOutline} onClick={handleLaunchApp}>Analyze Stock</button>
            <a href="#features" className={styles.btnSolid} style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>View Features</a>
          </div>
        </div>
        <div className={styles.heroImageWrapper}>
          <Image 
            src="/landing_page_image.png" 
            alt="Woman smiling at phone" 
            width={530} 
            height={530} 
            className={styles.heroImage}
            style={{ width: '100%', height: 'auto' }}
            priority
          />
        </div>
        
        {/* Wave background bottom of hero */}
        <svg className={styles.waveBottom} viewBox="0 0 1440 150" preserveAspectRatio="none">
          <path d="M0,64L80,74.7C160,85,320,107,480,101.3C640,96,800,64,960,64C1120,64,1280,96,1360,112L1440,128L1440,150L1360,150C1280,150,1120,150,960,150C800,150,640,150,480,150C320,150,160,150,80,150L0,150Z" />
        </svg>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>POWERFUL AI <strong>FINANCIAL ANALYTICS</strong></h2>
        
        <div className={styles.cards}>
          {/* Card 1 */}
          <div className={styles.card}>
            <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <h3>Live Market Intelligence</h3>
            <p>Retrieve live financial statements, company fundamentals, and market indicators directly from trusted financial data sources.</p>
          </div>
          
          {/* Card 2 */}
          <div className={styles.card}>
            <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <h3>AI-Powered Insights</h3>
            <p>Generate intelligent investment analysis using adaptive large language models combined with statistical financial metrics.</p>
          </div>
          
          {/* Card 3 */}
          <div className={styles.card}>
            <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M4.93 19.07l1.41-1.41" />
              <path d="M17.66 6.34l1.41-1.41" />
              <rect x="7" y="7" width="10" height="10" rx="2" />
            </svg>
            <h3>Interactive Financial Charts</h3>
            <p>Visualize historical stock performance with responsive charts and actionable financial indicators.</p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className={styles.infoSection}>
        <div className={styles.infoLeft}>
          <h2>WHY<br/><span>FINVISE.AI<br/>STANDS OUT</span></h2>
        </div>
        <div className={styles.infoRight}>
          <p>
            FinVise.AI combines real-time financial data, statistical analytics, and adaptive AI reasoning into one intelligent platform.
          </p>
          <p className={styles.aboutParagraph}>
            Built with a modern full-stack architecture, it empowers investors, students, and financial enthusiasts with institutional-grade stock analysis through a fast, intuitive interface.
          </p>
          <a href="#" className={styles.readMore}>
            LEARN MORE ABOUT FINVISE.AI
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className={styles.coreCapabilities}>
        <svg className={styles.waveTop} viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50L80,45C160,40,320,30,480,38.3C640,47,800,73,960,78.3C1120,83,1280,67,1360,58.3L1440,50L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z" />
        </svg>
        <div className={styles.capabilitiesContent}>
          <h2 className={styles.capabilitiesTitle}>CORE CAPABILITIES</h2>
          <div className={styles.capabilitiesGrid}>
            <div className={styles.capCard}>
              <h4>Dynamic Data Aggregation</h4>
              <p>Access real-time statements, valuation metrics, and market indicators for public companies.</p>
            </div>
            <div className={styles.capCard}>
              <h4>Intelligent Analytics Engine</h4>
              <p>Analyze profitability, valuation multiples, and financial health via high-performance algorithms.</p>
            </div>
            <div className={styles.capCard}>
              <h4>Interactive Visualization</h4>
              <p>Explore responsive historical price charts rendered for a seamless user experience.</p>
            </div>
            <div className={styles.capCard}>
              <h4>Adaptive AI Gateway</h4>
              <p>Seamlessly switch between local and cloud AI models through an intelligent routing engine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.realFooter}>
        <div className={styles.footerLinks}>
          <a href="#features">Features</a>
          <a href="#info">How It Works</a>
          <a href="#capabilities">Technology</a>
          <a href="#">Documentation</a>
          <a href="#">GitHub</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div className={styles.footerCopyright}>
          © 2026 FinVise.AI<br/>
          AI-Powered Financial Advisory Platform<br/>
          <span className={styles.techStack}>Built with Next.js • FastAPI • Tailwind CSS • AI</span>
        </div>
      </footer>
    </main>
  );
}
