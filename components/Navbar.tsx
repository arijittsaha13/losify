'use client';
import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser, logout, type User } from '../lib/authStore';
import { EditProfileModal } from './EditProfileModal';

export function Navbar() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    startTransition(() => router.replace('/login'));
  };

  return (
    <div className="sq-nav-wrapper">
      <nav className="sq-nav">
        <Link className="brand" href="/about" prefetch={true} onClick={() => setMobileMenuOpen(false)} title="Click to view details about Losify app">
          <Image
            src="/images/logo-transparent.png"
            alt="Losify Blue Logo"
            width={92}
            height={92}
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
            <Link href="/report/lost" className="sq-menu-link">
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
              {/* Profile Tag with Hover & Click Popup Menu */}
              <div
                ref={dropdownRef}
                style={{ position: 'relative' }}
              >
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 14px 5px 6px',
                    borderRadius: '99px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: user.role === 'hod' ? 'linear-gradient(135deg, #0f172a, #1e293b)' : '#ffffff',
                    color: user.role === 'hod' ? '#ffffff' : '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.role === 'hod' ? `🛡 ${user.name.split(' ')[0]}` : user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
                </button>

                {/* Profile Popup Menu on Hover / Click */}
                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '6px',
                      width: '270px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '18px',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                          ID: {user.registerId}
                        </div>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ✏ Edit Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #fee2e2',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      🚪 Log Out
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="sq-btn sq-btn-secondary sq-desktop-only"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="sq-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/login" className="sq-nav-login-link">
                Log In
              </Link>
              <Link href="/signup" className="sq-nav-signup-btn">
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
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsEditModalOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ✏ Edit Profile ({user.name})
              </button>
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
                Log Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link
                href="/login"
                className="sq-nav-login-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="sq-nav-signup-btn"
                onClick={() => setMobileMenuOpen(false)}
                style={{ flex: 1, textAlign: 'center' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
