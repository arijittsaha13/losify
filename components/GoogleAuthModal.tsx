'use client';
import { useState, useEffect } from 'react';
import { isGmailAddress, findUserByEmail } from '../lib/authStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userData: { email: string; name: string; registerId: string; role: 'student' | 'hod' }) => void;
  initialRole?: 'student' | 'hod';
  initialEmail?: string;
  initialName?: string;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onComplete,
  initialRole = 'student',
  initialEmail = 'arijitsaha1909@gmail.com',
  initialName = 'Arijit Saha',
}: GoogleAuthModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEmail, setSelectedEmail] = useState(initialEmail);
  const [selectedName, setSelectedName] = useState(initialName);
  const [selectedRole, setSelectedRole] = useState<'student' | 'hod'>(initialRole);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(undefined);
      setShowCustomInput(false);
      const existing = findUserByEmail(initialEmail);
      if (existing) {
        setSelectedName(existing.name);
        setSelectedRole(existing.role);
      } else {
        setSelectedName(initialName);
        setSelectedRole(initialRole);
      }
      setSelectedEmail(initialEmail);
    }
  }, [isOpen, initialEmail, initialName, initialRole]);

  if (!isOpen) return null;

  const handleSelectAccount = (email: string, name: string) => {
    setError(undefined);
    if (!isGmailAddress(email)) {
      setError('Only valid @gmail.com email addresses are permitted.');
      return;
    }
    const existing = findUserByEmail(email);
    setSelectedEmail(email);
    setSelectedName(existing?.name || name || email.split('@')[0]);
    setSelectedRole(existing?.role || initialRole);
    setStep(2);
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const trimmed = customEmail.trim().toLowerCase();
    if (!isGmailAddress(trimmed)) {
      setError('Only valid @gmail.com Google Accounts are allowed.');
      return;
    }
    handleSelectAccount(trimmed, customName.trim() || trimmed.split('@')[0]);
  };

  const handleFinalSubmit = () => {
    const regId = selectedRole === 'hod'
      ? `HOD-${Math.floor(100 + Math.random() * 900)}`
      : `STU-${Math.floor(100000 + Math.random() * 900000)}`;

    onComplete({
      email: selectedEmail,
      name: selectedName,
      registerId: regId,
      role: selectedRole,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#1e1e1e',
          borderRadius: '28px',
          border: '1px solid #2e2e2e',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          color: '#e3e3e3',
          padding: '40px 48px',
          position: 'relative',
        }}
      >
        {/* Header with Google logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span style={{ fontSize: '15px', color: '#c4c7c5', fontWeight: 500 }}>Sign in with Google</span>
        </div>

        {error && (
          <div style={{ background: '#3c1818', color: '#f87171', border: '1px solid #7f1d1d', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
            ⚠ {error}
          </div>
        )}

        {/* STEP 1: CHOOSE AN ACCOUNT */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 400, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Choose an account
            </h1>
            <p style={{ fontSize: '16px', color: '#c4c7c5', margin: '0 0 32px 0' }}>
              to continue to <strong style={{ color: '#ffffff' }}>Losify.com</strong>
            </p>

            {/* Account List Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#282828', borderRadius: '16px', overflow: 'hidden', border: '1px solid #333333', marginBottom: '32px' }}>
              {/* Default Account Option 1 */}
              <button
                type="button"
                onClick={() => handleSelectAccount(selectedEmail, selectedName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  backgroundColor: '#1e1e1e',
                  border: 'none',
                  borderBottom: '1px solid #2d2d2d',
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                  {selectedName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{selectedName}</div>
                  <div style={{ fontSize: '13px', color: '#9aa0a6' }}>{selectedEmail}</div>
                </div>
              </button>

              {/* Account Option 2: Use another account */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    backgroundColor: '#1e1e1e',
                    border: 'none',
                    color: '#e3e3e3',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #444444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4c7c5' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Use another account</div>
                </button>
              ) : (
                <form onSubmit={handleCustomAccountSubmit} style={{ padding: '20px', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your @gmail.com address"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#121212', color: '#fff', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#121212', color: '#fff', fontSize: '14px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444', background: 'transparent', color: '#ccc', cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Next →
                    </button>
                  </div>
                </form>
              )}
            </div>

            <p style={{ fontSize: '13px', color: '#9aa0a6', lineHeight: 1.5, marginBottom: '28px' }}>
              Before using this app, you can review Losify.com’s <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Terms of Service</span>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2e2e2e', paddingTop: '20px', fontSize: '12px', color: '#9aa0a6' }}>
              <span>English (United States) ▼</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ cursor: 'pointer' }}>Help</span>
                <span style={{ cursor: 'pointer' }}>Privacy</span>
                <span style={{ cursor: 'pointer' }}>Terms</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SIGN IN TO LOSIFY.COM */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 400, color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
              Sign in to Losify.com
            </h1>

            {/* Selected Account Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#282828', padding: '6px 14px 6px 8px', borderRadius: '20px', border: '1px solid #3c3c3c', marginBottom: '28px', cursor: 'pointer' }} onClick={() => setStep(1)}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                {selectedName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>{selectedEmail}</span>
              <span style={{ fontSize: '10px', color: '#9aa0a6' }}>▼</span>
            </div>

            {/* Permission Scopes Grid */}
            <div style={{ backgroundColor: '#181818', borderRadius: '20px', padding: '24px', border: '1px solid #2b2b2b', marginBottom: '24px' }}>
              <div style={{ fontSize: '15px', color: '#e3e3e3', fontWeight: 500, marginBottom: '20px', lineHeight: 1.4 }}>
                Google will allow Losify.com to access this info about you
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Scope Item 1 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#8ab4f8', marginTop: '2px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{selectedName}</div>
                    <div style={{ fontSize: '12px', color: '#9aa0a6' }}>Name and profile picture</div>
                  </div>
                </div>

                {/* Scope Item 2 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#8ab4f8', marginTop: '2px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{selectedEmail}</div>
                    <div style={{ fontSize: '12px', color: '#9aa0a6' }}>Email address</div>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#9aa0a6', lineHeight: 1.5, marginBottom: '28px' }}>
              Review Losify.com’s <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Terms of Service</span> to understand how Losify.com will process and protect your data. To make changes at any time, go to your Google Account. <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Learn more about Sign in with Google.</span>
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #2e2e2e', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 28px',
                  borderRadius: '24px',
                  border: '1px solid #5f6368',
                  backgroundColor: 'transparent',
                  color: '#8ab4f8',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(138, 180, 248, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                style={{
                  padding: '12px 32px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: '#8ab4f8',
                  color: '#040d1a',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1.0')}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
