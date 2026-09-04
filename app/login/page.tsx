'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { login, completeGoogleRegistration, isGmailAddress } from '../../lib/authStore';
import { auth, googleProvider, signInWithPopup } from '../../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<'student' | 'hod'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleRoleSwitch = (role: 'student' | 'hod') => {
    setActiveRole(role);
    setError(undefined);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!isGmailAddress(email)) {
      setError('Access denied: Only valid @gmail.com email addresses are allowed.');
      return;
    }

    try {
      const user = login(email, password, activeRole);
      startTransition(() => {
        if (user.role === 'hod') {
          router.push('/hod');
        } else {
          router.push('/dashboard');
        }
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleGoogleLoginClick = async () => {
    setError(undefined);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const userEmail = googleUser.email || '';
      const userName = googleUser.displayName || userEmail.split('@')[0] || 'User';

      if (!isGmailAddress(userEmail)) {
        setError('Access denied: Only valid @gmail.com email addresses are allowed.');
        return;
      }

      const user = completeGoogleRegistration({
        email: userEmail,
        name: userName,
        registerId: `GOOG-${googleUser.uid.substring(0, 8)}`,
        role: activeRole,
      });

      startTransition(() => {
        if (user.role === 'hod') {
          router.push('/hod');
        } else {
          router.push('/dashboard');
        }
      });
    } catch (err: unknown) {
      console.error('Google OAuth error:', err);
      if (err && typeof err === 'object' && 'code' in err && err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err && typeof err === 'object' && 'code' in err && err.code === 'auth/api-key-not-valid') {
        setError('Firebase Google OAuth setup required: Please configure your live NEXT_PUBLIC_FIREBASE_API_KEY environment variable in Vercel.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg, #ffffff)', color: 'var(--text-main, #111111)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '24px 40px' }}>
        <Link href="/signup" prefetch={true} style={{ textDecoration: 'none', color: 'var(--text-main, #111111)', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px' }}>
          CREATE ACCOUNT
        </Link>
      </header>

      {/* Main Login Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 60px' }}>
        {/* Brand Emblem Logo Icon */}
        <div style={{ marginBottom: '24px' }}>
          <Image
            src="/images/logo-transparent.png"
            alt="Losify Logo"
            width={152}
            height={152}
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(37, 99, 235, 0.45))' }}
            priority
          />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-main, #111111)', margin: '0 0 24px 0', textAlign: 'center' }}>
          Log into Losify
        </h1>

        {/* Separate Role Tabs */}
        <div style={{ display: 'flex', background: 'var(--tab-bg, #f4f4f5)', padding: '4px', borderRadius: '12px', marginBottom: '28px', maxWidth: '380px', width: '100%' }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('student')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeRole === 'student' ? 'var(--tab-active-bg, #ffffff)' : 'transparent',
              color: activeRole === 'student' ? 'var(--text-main, #0f172a)' : 'var(--text-sub, #64748b)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeRole === 'student' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('hod')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeRole === 'hod' ? '#0f172a' : 'transparent',
              color: activeRole === 'hod' ? '#ffffff' : '#64748b',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeRole === 'hod' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            HOD Login
          </button>
        </div>

        {error && (
          <div style={{ border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', padding: '12px 20px', borderRadius: '8px', maxWidth: '420px', width: '100%', marginBottom: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>
            ⚠ {error}
          </div>
        )}

        {/* Stacked Single-Column Form */}
        <div style={{ maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                {activeRole === 'hod' ? 'HOD ADMIN GMAIL ADDRESS' : 'STUDENT GMAIL ADDRESS'}
              </label>
              <input
                type="email"
                required
                placeholder={activeRole === 'hod' ? 'hod.losify@gmail.com' : 'yourname@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="sq-input-underline"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', margin: 0 }}>
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666', fontSize: '12px', fontWeight: 700, padding: 0 }}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="sq-input-underline"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                marginTop: '8px',
                padding: '14px',
                background: activeRole === 'hod' ? '#0f172a' : '#111111',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isPending ? 'LOGGING IN…' : activeRole === 'hod' ? 'LOG IN AS HOD ADMIN' : 'LOG IN AS STUDENT'}
            </button>
          </form>

          {/* OR Horizontal Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }} />
          </div>

          {/* Google Login Button directly below */}
          <button
            type="button"
            onClick={handleGoogleLoginClick}
            className="sq-btn-social"
            style={{ padding: '14px 24px', fontSize: '14px', border: '2px solid #4285F4', borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Bottom Link */}
        <Link href="/signup" style={{ textDecoration: 'none', color: '#111111', fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', marginTop: '48px' }}>
          NEED AN ACCOUNT? SIGN UP HERE
        </Link>
      </main>
    </div>
  );
}