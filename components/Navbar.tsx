'use client';
import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser, logout, type User } from '../lib/authStore';

export function Navbar() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let prevUserJson = '';
    const update = () => {
      const current = getCurrentUser();
      const currentJson = JSON.stringify(current);
      if (currentJson !== prevUserJson) {
        prevUserJson = currentJson;
        setUser(current);
      }
    };
    update();
    window.addEventListener('authChange', update);
    return () => window.removeEventListener('authChange', update);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    startTransition(() => router.replace('/login'));
  };

  return (
    <div className="sq-nav-wrapper">
      <nav className="sq-nav">
        <Link className="brand" href="/" prefetch={true} onClick={() => setMobileMenuOpen(false)}>
          <Image
            src="/images/logo-transparent.png"
            alt="Losify Golden Logo"
            width={44}
            height={44}
            className="brand-logo-img"
            priority
          />
          <span className="brand-text">LOS<span className="brand-accent">IFY</span></span>
        </Link>

        {/* Desktop Menu */}
        <ul className="sq-menu-list">
          <li className="sq-menu-item">
            <Link href="/dashboard" className="sq-menu-link">
              Live Dashboard
            </Link>
          </li>
          <li className="sq-menu-item">
            <Link href="/report/lost" className="sq-menu-link" style={{ color: 'var(--sq-accent-blue)' }}>
              + Report Lost
            </Link>
          </li>
          <li className="sq-menu-item">
            <Link href="/report/found" className="sq-menu-link">
              + Report Found
            </Link>
          </li>
          <li className="sq-menu-item">
            <Link href="/hod" className="sq-menu-link">
              HOD Control Desk
            </Link>
          </li>
        </ul>

        {/* Right Nav Action Buttons & Mobile Toggle */}
        <div className="sq-nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: user.role === 'hod' ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : '#f1f5f9',
                  color: user.role === 'hod' ? '#09090b' : '#0f172a',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.role === 'hod' ? '🛡 HOD:' : '👤'} {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="sq-btn sq-btn-secondary sq-desktop-only"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="sq-desktop-only" style={{ display: 'flex', gap: 8 }}>
              <Link href="/login" className="sq-btn sq-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Log In
              </Link>
              <Link href="/signup" className="sq-btn sq-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="sq-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            style={{
              display: 'none',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#0f172a',
              fontWeight: 700,
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className="sq-mobile-menu"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
            padding: '16px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <Link href="/dashboard" className="sq-mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            📊 Live Dashboard
          </Link>
          <Link href="/report/lost" className="sq-mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            🔍 Report Lost Item
          </Link>
          <Link href="/report/found" className="sq-mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            📦 Report Found Item
          </Link>
          <Link href="/hod" className="sq-mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
            🛡 HOD Desk
          </Link>
          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
          {user ? (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ef4444',
                background: '#fef2f2',
                color: '#b91c1c',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Log Out ({user.name})
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
