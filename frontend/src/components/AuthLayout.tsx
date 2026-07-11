import React from 'react';
import Image from 'next/image';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  description: string;
}

export default function AuthLayout({ children, description }: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      {/* Left Showcase */}
      <div className={styles.leftSection}>
        <div className={styles.centeredContent}>
          {/* Logo Section */}
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <Image src="/logo.png" alt="FinVise.AI Logo" width={40} height={40} />
            </div>
            <span className={styles.brandName}>FinVise.AI</span>
            <div className={styles.divider}></div>
            <span className={styles.tagline}>AI Financial Advisor</span>
          </div>

          {/* Hero Content */}
          <div className={styles.mainContent}>
            <h1 className={styles.heroHeading}>
              AI-POWERED<br/>
              FINANCIAL INSIGHTS,<br/>
              <span className={styles.heroHeadingWhite}>BETTER INVESTMENTS.</span>
            </h1>
            <p className={styles.description}>
              {description}
            </p>
          </div>

          {/* Illustration */}
          <div className={styles.illustrationWrapper}>
            <div className={styles.circularGlow}></div>
            <div className={styles.dottedPattern}></div>
            <Image 
              src="/Authentication_Page_image.png" 
              alt="Platform Illustration" 
              width={600} 
              height={400} 
              className={styles.illustration}
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </div>

          {/* Feature Row */}
          <div className={styles.featuresRow}>
            <div className={styles.feature}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0093FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className={styles.featureTitle}>Real-Time Data</div>
              <div className={styles.featureDesc}>Live market data and<br/>company information</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0093FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className={styles.featureTitle}>AI-Powered Analysis</div>
              <div className={styles.featureDesc}>Advanced AI models for<br/>smarter insights</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0093FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              </div>
              <div className={styles.featureTitle}>Secure & Private</div>
              <div className={styles.featureDesc}>Your data is encrypted<br/>and always protected</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          © 2026 FinVise.AI. All rights reserved.
        </div>
      </div>

      {/* Right Authentication Card Area */}
      <div className={styles.rightSection}>
        {children}
      </div>
    </div>
  );
}
