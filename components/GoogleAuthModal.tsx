'use client';
import { useState, useEffect } from 'react';
import { isGmailAddress, findUserByEmail, completeGoogleRegistration } from '../lib/authStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userData: { email: string; name: string; registerId: string; role: 'student' | 'hod' }) => void;
  initialRole?: 'student' | 'hod';
  initialEmail?: string;
  initialName?: string;
}

export function deriveNameFromEmail(email: string, rawName?: string): string {
  if (rawName && rawName.trim() && rawName !== 'Google User' && rawName !== 'Google Account' && rawName !== 'User') {
    return rawName.trim();
  }
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  if (!cleanEmail || !cleanEmail.includes('@')) return '';

  const userPart = cleanEmail.split('@')[0];
  const parts = userPart
    .replace(/[0-9]+/g, ' ')
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(/\s+/);

  const cleanParts = parts.filter(p => p.length > 0);
  if (cleanParts.length === 0) return 'Student User';

  const formatted = cleanParts
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');

  return formatted || 'Student User';
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onComplete,
  initialRole = 'student',
  initialEmail = '',
  initialName = '',
}: GoogleAuthModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showManualInput, setShowManualInput] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'hod'>(initialRole);
  
  // Step 3 Profile Completion state
  const [registerId, setRegisterId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(undefined);

      let targetEmail = initialEmail.trim();
      let targetName = initialName.trim();

      if (!targetEmail && typeof window !== 'undefined') {
        targetEmail = localStorage.getItem('losify_last_google_email') || 'arijitsaha1909@gmail.com';
        targetName = localStorage.getItem('losify_last_google_name') || 'Arijit Saha';
      }

      if (targetName === 'Google User' || targetName === 'Google Account') {
        targetName = '';
      }

      if (targetEmail) {
        const computedName = deriveNameFromEmail(targetEmail, targetName);
        setSelectedEmail(targetEmail);
        setSelectedName(computedName);
        setInputEmail(targetEmail);
        setInputName(computedName);
        setShowManualInput(false);

        const existing = findUserByEmail(targetEmail);
        if (existing) {
          setSelectedName(existing.name);
          setInputName(existing.name);
          setSelectedRole(existing.role);
          if (existing.registerId) setRegisterId(existing.registerId);
        } else {
          setSelectedRole(initialRole);
          setRegisterId('');
        }
      } else {
        setSelectedEmail('arijitsaha1909@gmail.com');
        setSelectedName('Arijit Saha');
        setInputEmail('arijitsaha1909@gmail.com');
        setInputName('Arijit Saha');
        setShowManualInput(false);
      }
    }
  }, [isOpen, initialEmail, initialName, initialRole]);

  if (!isOpen) return null;

  const handleSelectAccount = (emailToVerify: string, nameToUse: string) => {
    setError(undefined);
    const cleanEmail = emailToVerify.trim().toLowerCase();
    if (!cleanEmail || !isGmailAddress(cleanEmail)) {
      setError('Please enter a valid @gmail.com Google Account email address.');
      return;
    }
    const existing = findUserByEmail(cleanEmail);
    const finalName = (existing?.name && existing.name !== 'Google User') 
      ? existing.name 
      : deriveNameFromEmail(cleanEmail, nameToUse);
    
    setSelectedEmail(cleanEmail);
    setSelectedName(finalName);
    setSelectedRole(existing?.role || initialRole);
    if (existing?.registerId) {
      setRegisterId(existing.registerId);
    }
    setStep(2);
  };

  const handleGoToStep3 = () => {
    setError(undefined);
    const existing = findUserByEmail(selectedEmail);
    if (existing && existing.registerId) {
      setRegisterId(existing.registerId);
    }
    setStep(3);
  };

  const handleFinalSubmit = () => {
    setError(undefined);
    const cleanRegId = registerId.trim();
    if (!cleanRegId) {
      setError('Please enter your official Registration Number / Roll No. to complete your profile.');
      return;
    }

    const finalName = deriveNameFromEmail(selectedEmail, selectedName || inputName);
    
    completeGoogleRegistration({
      email: selectedEmail,
      name: finalName,
      registerId: cleanRegId,
      role: selectedRole,
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('losify_last_google_email', selectedEmail);
        localStorage.setItem('losify_last_google_name', finalName);
      } catch {}
    }

    onComplete({
      email: selectedEmail,
      name: finalName,
      registerId: cleanRegId,
      role: selectedRole,
    });
  };

  const currentDisplayName = deriveNameFromEmail(selectedEmail || inputEmail, selectedName || inputName) || 'Student User';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Google Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#1f1f1f',
          borderRadius: '28px',
          border: '1px solid #2d2d2d',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
          color: '#e3e3e3',
          padding: '40px 44px',
          position: 'relative',
        }}
      >
        {/* Header with Google logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span style={{ fontSize: '15px', color: '#e3e3e3', fontWeight: 500 }}>
            Sign in with Google
          </span>
        </div>

        {error && (
          <div style={{ background: '#3c1818', color: '#f87171', border: '1px solid #7f1d1d', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '24px', fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        {/* STEP 1: CHOOSE AN ACCOUNT (2-Column Layout matching Screenshot) */}
        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start', marginBottom: '36px' }}>
              {/* Left Column: Heading & Info */}
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: 400, color: '#ffffff', margin: '0 0 12px 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  Choose an account
                </h1>
                <p style={{ fontSize: '16px', color: '#c4c7c5', margin: 0, lineHeight: 1.5 }}>
                  to continue to <strong style={{ color: '#ffffff', fontWeight: 600 }}>Losify.com</strong>
                </p>
              </div>

              {/* Right Column: Account Card Box */}
              <div>
                <div style={{ backgroundColor: '#181818', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2e2e2e' }}>
                  {selectedEmail && !showManualInput && (
                    <button
                      type="button"
                      onClick={() => handleSelectAccount(selectedEmail, selectedName)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        backgroundColor: '#181818',
                        border: 'none',
                        borderBottom: '1px solid #282828',
                        color: '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#252525')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '17px' }}>
                        {currentDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{currentDisplayName}</div>
                        <div style={{ fontSize: '13px', color: '#9aa0a6' }}>{selectedEmail}</div>
                      </div>
                    </button>
                  )}

                  {!showManualInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualInput(true);
                        setInputEmail('');
                        setInputName('');
                        setError(undefined);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px 20px',
                        backgroundColor: '#181818',
                        border: 'none',
                        color: '#e3e3e3',
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#252525')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
                    >
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9aa0a6' }}>
                        +
                      </div>
                      <span>Use another account</span>
                    </button>
                  )}

                  {showManualInput && (
                    <div style={{ padding: '20px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#ffffff', marginBottom: '6px', fontWeight: 600 }}>
                        Google Email Address:
                      </label>
                      <input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInputEmail(val);
                          setSelectedEmail(val);
                          const derived = deriveNameFromEmail(val, inputName);
                          setInputName(derived);
                          setSelectedName(derived);
                          setError(undefined);
                        }}
                        placeholder="e.g. yourname@gmail.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#282828',
                          border: '1px solid #3c3c3c',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          marginBottom: '12px',
                        }}
                      />

                      <label style={{ display: 'block', fontSize: '13px', color: '#ffffff', marginBottom: '6px', fontWeight: 600 }}>
                        Your Name:
                      </label>
                      <input
                        type="text"
                        value={inputName}
                        onChange={(e) => {
                          setInputName(e.target.value);
                          setSelectedName(e.target.value);
                        }}
                        placeholder="e.g. Arijit Saha"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#282828',
                          border: '1px solid #3c3c3c',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          marginBottom: '16px',
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {selectedEmail && (
                          <button
                            type="button"
                            onClick={() => setShowManualInput(false)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '20px',
                              border: '1px solid #5f6368',
                              backgroundColor: 'transparent',
                              color: '#9aa0a6',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSelectAccount(inputEmail, inputName)}
                          style={{
                            padding: '8px 24px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#8ab4f8',
                            color: '#040d1a',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#9aa0a6', lineHeight: 1.5, marginBottom: '28px' }}>
              Before using this app, you can review Losify.com’s <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Terms of Service</span>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2d2d2d', paddingTop: '20px', fontSize: '12px', color: '#9aa0a6' }}>
              <span>English (United States) ▼</span>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ cursor: 'pointer' }}>Help</span>
                <span style={{ cursor: 'pointer' }}>Privacy</span>
                <span style={{ cursor: 'pointer' }}>Terms</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SIGN IN TO LOSIFY.COM (Exact Screenshot Match) */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start', marginBottom: '32px' }}>
              {/* Left Column: Heading & Account Pill */}
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: 400, color: '#ffffff', margin: '0 0 20px 0', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  Sign in to Losify.com
                </h1>

                {/* Selected Account Badge Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#181818',
                    padding: '6px 14px 6px 8px',
                    borderRadius: '20px',
                    border: '1px solid #3c3c3c',
                    cursor: 'pointer',
                  }}
                  onClick={() => setStep(1)}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {(selectedEmail || 'G').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500 }}>{selectedEmail}</span>
                  <span style={{ fontSize: '10px', color: '#9aa0a6' }}>▼</span>
                </div>
              </div>

              {/* Right Column: Permission Scopes & Details */}
              <div>
                <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: 400, marginBottom: '24px', lineHeight: 1.4 }}>
                  Google will allow Losify.com to access this info about you
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                  {/* Scope Item 1: Name and profile picture */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#8ab4f8', marginTop: '2px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                        {currentDisplayName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#9aa0a6' }}>Name and profile picture</div>
                    </div>
                  </div>

                  {/* Scope Item 2: Email address */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#8ab4f8', marginTop: '2px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>{selectedEmail}</div>
                      <div style={{ fontSize: '13px', color: '#9aa0a6' }}>Email address</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#9aa0a6', lineHeight: 1.5, marginBottom: '32px' }}>
                  Review Losify.com’s <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Terms of Service</span> to understand how Losify.com will process and protect your data. To make changes at any time, go to your Google Account. <span style={{ color: '#8ab4f8', cursor: 'pointer' }}>Learn more about Sign in with Google.</span>
                </p>

                {/* Bottom Right Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '20px',
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
                    onClick={handleGoToStep3}
                    style={{
                      padding: '10px 32px',
                      borderRadius: '20px',
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2d2d2d', paddingTop: '20px', fontSize: '12px', color: '#9aa0a6' }}>
              <span>English (United States) ▼</span>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ cursor: 'pointer' }}>Help</span>
                <span style={{ cursor: 'pointer' }}>Privacy</span>
                <span style={{ cursor: 'pointer' }}>Terms</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETE YOUR PROFILE (NAME & REGISTER NO.) */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                {(selectedEmail || 'G').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                  Complete Your Profile
                </h1>
                <div style={{ fontSize: '13px', color: '#9aa0a6' }}>
                  Connected Google Account: <span style={{ color: '#8ab4f8', fontWeight: 500 }}>{selectedEmail}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#c4c7c5', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Please enter your official student / staff registration details to complete your account setup on <strong>Losify.com</strong>.
            </p>

            <div style={{ backgroundColor: '#181818', borderRadius: '20px', padding: '24px', border: '1px solid #2b2b2b', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Full Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#e3e3e3', marginBottom: '6px', fontWeight: 600 }}>
                  Full Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  value={selectedName || inputName}
                  onChange={(e) => {
                    setSelectedName(e.target.value);
                    setInputName(e.target.value);
                  }}
                  placeholder="e.g. Arijit Saha"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#282828',
                    border: '1px solid #3c3c3c',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Registration Number Field */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#e3e3e3', marginBottom: '6px', fontWeight: 600 }}>
                  Registration Number / Roll No. <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  value={registerId}
                  onChange={(e) => {
                    setRegisterId(e.target.value);
                    setError(undefined);
                  }}
                  placeholder="e.g. 21BCE1045 or STU-2026-001"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#282828',
                    border: '1px solid #3c3c3c',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9aa0a6', marginTop: '4px' }}>
                  This official ID will be attached to your lost and found claims.
                </div>
              </div>

              {/* Department Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#e3e3e3', marginBottom: '6px', fontWeight: 600 }}>
                  Department / Branch
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#282828',
                    border: '1px solid #3c3c3c',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Other / General">Other / General</option>
                </select>
              </div>

              {/* Phone Number Field */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#e3e3e3', marginBottom: '6px', fontWeight: 600 }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#282828',
                    border: '1px solid #3c3c3c',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2d2d2d', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: '1px solid #5f6368',
                  backgroundColor: 'transparent',
                  color: '#9aa0a6',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                style={{
                  padding: '10px 32px',
                  borderRadius: '20px',
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
                Complete Signup &amp; Launch Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
