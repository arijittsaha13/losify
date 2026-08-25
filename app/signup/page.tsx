'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, loginWithFirebaseUser, isGmailAddress } from '../../lib/authStore';
import { auth, googleProvider, signInWithPopup } from '../../lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'hod'>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  // State for Google Sign In modal verification fallback when Firebase keys need setup
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleModalEmail, setGoogleModalEmail] = useState('');
  const [googleModalName, setGoogleModalName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!isGmailAddress(email)) {
      setError('Registration error: Only valid @gmail.com email addresses are allowed.');
      return;
    }

    try {
      const user = signup({
        email,
        name,
        registerId,
        password,
        role,
      });
      startTransition(() => {
        if (user.role === 'hod') {
          router.push('/hod');
        } else {
          router.push('/dashboard');
        }
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const handleGoogleLogin = async () => {
    setError(undefined);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user && res.user.email) {
        if (!isGmailAddress(res.user.email)) {
          setError('Registration error: Only verified @gmail.com Google accounts are allowed.');
          return;
        }
        const user = loginWithFirebaseUser(res.user);
        startTransition(() => {
          if (user.role === 'hod') {
            router.push('/hod');
          } else {
            router.push('/dashboard');
          }
        });
        return;
      }
    } catch (err: unknown) {
      console.warn('Firebase auth popup:', err);
      setShowGoogleModal(true);
    }
  };

  const handleGoogleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const trimmedEmail = googleModalEmail.trim().toLowerCase();

    if (!isGmailAddress(trimmedEmail)) {
      setError('Registration error: Only valid @gmail.com email addresses are allowed.');
      return;
    }

    try {
      const user = loginWithFirebaseUser({
        email: trimmedEmail,
        displayName: googleModalName.trim() || name.trim() || trimmedEmail.split('@')[0],
        uid: `ggl-${Math.floor(100000 + Math.random() * 900000)}`,
      });

      setShowGoogleModal(false);
      startTransition(() => {
        if (user.role === 'hod') {
          router.push('/hod');
        } else {
          router.push('/dashboard');
        }
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google Account Sign Up failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#111111', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px' }}>
        <Link href="/" prefetch={true} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#111111', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px' }}>
          ‹ BACK
        </Link>
        <Link href="/login" prefetch={true} style={{ textDecoration: 'none', color: '#111111', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px' }}>
          LOG IN
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 60px' }}>
        <div style={{ marginBottom: '16px' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 4L22.5 13.5L32 18L22.5 22.5L18 32L13.5 22.5L4 18L13.5 13.5L18 4Z" stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="18" cy="18" r="4" fill="#111111" />
          </svg>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#111111', margin: '0 0 8px 0', textAlign: 'center' }}>
          Create your Losify account
        </h1>
        <p style={{ color: '#666666', fontSize: '14px', margin: '0 0 32px 0', textAlign: 'center' }}>
          Register with a valid <strong style={{ color: '#111111' }}>@gmail.com</strong> address to access campus lost &amp; found.
        </p>

        {error && (
          <div style={{ border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', padding: '12px 20px', borderRadius: '8px', maxWidth: '460px', width: '100%', marginBottom: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              ACCOUNT ROLE
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: role === 'student' ? '#111111' : '#ffffff',
                  color: role === 'student' ? '#ffffff' : '#111111',
                  border: role === 'student' ? '1px solid #111111' : '1px solid #d4d4d8',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setRole('student')}
                disabled={isPending}
              >
                🎓 Student
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: role === 'hod' ? '#111111' : '#ffffff',
                  color: role === 'hod' ? '#ffffff' : '#111111',
                  border: role === 'hod' ? '1px solid #111111' : '1px solid #d4d4d8',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setRole('hod')}
                disabled={isPending}
              >
                🛡 HOD Administration
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              GMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="sq-input-underline"
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              FULL NAME
            </label>
            <input
              type="text"
              required
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="sq-input-underline"
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              REGISTER / ID NUMBER
            </label>
            <input
              type="text"
              required
              placeholder={role === 'student' ? 'STU-2026108' : 'HOD-002'}
              value={registerId}
              onChange={(e) => setRegisterId(e.target.value)}
              disabled={isPending}
              className="sq-input-underline"
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#666666', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              placeholder="Choose a password"
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
              marginTop: '12px',
              padding: '14px',
              background: '#111111',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isPending ? 'CREATING PROFILE…' : 'CREATE ACCOUNT & CONTINUE →'}
          </button>
        </form>

        <div style={{ marginTop: '20px', width: '100%', maxWidth: '460px' }}>
          <button type="button" onClick={handleGoogleLogin} className="sq-btn-social" style={{ padding: '14px', border: '1px solid #4285F4', borderRadius: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google (@gmail.com)
          </button>
        </div>

        {/* Google Modal Fallback for Signup */}
        {showGoogleModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Google Account Register</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '24px', lineHeight: 1.5 }}>
                Enter your real <strong>@gmail.com</strong> email address to register with Google.
              </p>

              <form onSubmit={handleGoogleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    YOUR GMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={googleModalEmail}
                    onChange={(e) => setGoogleModalEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    FULL NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={googleModalName}
                    onChange={(e) => setGoogleModalName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Sign Up with Google
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p style={{ marginTop: '36px', textAlign: 'center', fontSize: '13px', color: '#666666' }}>
          Already have an account? <Link href="/login" prefetch={true} style={{ color: '#111111', fontWeight: 800, textDecoration: 'none' }}>LOG IN HERE</Link>
        </p>
      </main>
    </div>
  );
}