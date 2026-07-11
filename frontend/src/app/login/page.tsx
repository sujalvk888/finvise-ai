'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth';
import styles from './page.module.css';
import AuthLayout from '@/components/AuthLayout';

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await authService.login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className={styles.card}>
      <Link href="/" className={styles.backButton}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </Link>
      <h1 className={styles.title}>Welcome back!</h1>
      <p className={styles.subtitle}>Sign in to continue to your FinVise.AI account.</p>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email address</label>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              className={styles.input}
              required 
            />
          </div>
        </div>
        
        <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              className={styles.input}
              required 
            />
            <button 
              type="button" 
              className={styles.eyeIcon} 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.rememberRow}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" />
            Remember me
          </label>
        </div>

        <button type="submit" className={styles.button}>
          Sign In
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>

      <div className={styles.bottomLink}>
        Don&apos;t have an account? <Link href="/register">Create one</Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <AuthLayout description="Analyze any public stock with real-time data,&#10;advanced analytics, and intelligent AI insights—&#10;all in one platform.">
      <LoginContent />
    </AuthLayout>
  );
}
