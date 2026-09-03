'use client';
import { useState, useEffect, useRef } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply theme to HTML tag
  const applyTheme = (mode: ThemeMode) => {
    let effectiveTheme: 'light' | 'dark' = 'light';
    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemDark ? 'dark' : 'light';
    } else {
      effectiveTheme = mode;
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);
  };

  useEffect(() => {
    // Load saved theme preference
    const saved = localStorage.getItem('losify-theme') as ThemeMode | null;
    const initialMode = saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    setTheme(initialMode);
    applyTheme(initialMode);

    // Listen to system color scheme changes if mode is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentMode = (localStorage.getItem('losify-theme') as ThemeMode) || 'system';
      if (currentMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem('losify-theme', mode);
    applyTheme(mode);
    setIsOpen(false);
  };

  const getIcon = (mode: ThemeMode) => {
    if (mode === 'light') return '☀️';
    if (mode === 'dark') return '🌙';
    return '💻';
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        fontFamily: 'var(--font-sans), sans-serif',
      }}
    >
      {/* Dropdown Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '56px',
            right: '0',
            width: '180px',
            background: 'var(--sq-card-bg, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: '#94a3b8', padding: '6px 10px', textTransform: 'uppercase' }}>
            APPEARANCE
          </div>

          <button
            type="button"
            onClick={() => selectTheme('light')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: theme === 'light' ? '#eff6ff' : 'transparent',
              color: theme === 'light' ? '#2563eb' : 'inherit',
              fontWeight: theme === 'light' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>☀️</span> Light Mode
            </span>
            {theme === 'light' && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => selectTheme('dark')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: theme === 'dark' ? '#eff6ff' : 'transparent',
              color: theme === 'dark' ? '#2563eb' : 'inherit',
              fontWeight: theme === 'dark' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌙</span> Dark Mode
            </span>
            {theme === 'dark' && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => selectTheme('system')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: theme === 'system' ? '#eff6ff' : 'transparent',
              color: theme === 'system' ? '#2563eb' : 'inherit',
              fontWeight: theme === 'system' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💻</span> System Default
            </span>
            {theme === 'system' && <span>✓</span>}
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '99px',
          background: '#0f172a',
          color: '#ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '13px',
          transition: 'all 0.2s ease',
        }}
        title="Switch Theme Appearance (Light, Dark, System)"
      >
        <span style={{ fontSize: '15px' }}>{getIcon(theme)}</span>
        <span style={{ textTransform: 'capitalize' }}>
          {theme === 'system' ? 'System' : theme}
        </span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>{isOpen ? '▲' : '▼'}</span>
      </button>
    </div>
  );
}
