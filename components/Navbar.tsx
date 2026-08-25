'use client';
import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout, type User } from '../lib/authStore';

export function Navbar() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);

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
    startTransition(() => router.replace('/login'));
  };

  return (
    <div className="sq-nav-wrapper">
      <nav className="sq-nav">
        {/* Brand Logo */}
        <Link className="brand" href="/" prefetch={true}>
          LOS<span className="brand-accent">IFY</span>
        </Link>

        {/* Informational dropdown menus */}
        <ul className="sq-menu-list">
          {/* Products Dropdown */}
          <li className="sq-menu-item">
            <span className="sq-menu-link">
              Products <span className="sq-menu-chevron">▼</span>
            </span>
            <div className="sq-dropdown">
              <div className="sq-dropdown-grid">
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">🔎</div>
                  <div>
                    <div className="sq-dropdown-title">Smart Item Matching</div>
                    <div className="sq-dropdown-desc">Compares item photos and descriptions to find likely matches</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">🛡</div>
                  <div>
                    <div className="sq-dropdown-title">HOD Secure Vault</div>
                    <div className="sq-dropdown-desc">Official departmental custody & verified claims</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">⚡</div>
                  <div>
                    <div className="sq-dropdown-title">Instant Alerts</div>
                    <div className="sq-dropdown-desc">Real-time alerts when matched items surface</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">📊</div>
                  <div>
                    <div className="sq-dropdown-title">Match Dashboard</div>
                    <div className="sq-dropdown-desc">Centralized tracker for active campus reports</div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Categories Dropdown */}
          <li className="sq-menu-item">
            <span className="sq-menu-link">
              Categories <span className="sq-menu-chevron">▼</span>
            </span>
            <div className="sq-dropdown" style={{ minWidth: '520px' }}>
              <div className="sq-dropdown-grid">
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">💻</div>
                  <div>
                    <div className="sq-dropdown-title">Electronics</div>
                    <div className="sq-dropdown-desc">Laptops, phones, AirPods & smartwatches</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">💳</div>
                  <div>
                    <div className="sq-dropdown-title">IDs & Cards</div>
                    <div className="sq-dropdown-desc">Student ID cards, wallets & key fobs</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">🎒</div>
                  <div>
                    <div className="sq-dropdown-title">Bags & Apparel</div>
                    <div className="sq-dropdown-desc">Backpacks, hoodies, jackets & accessories</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">📚</div>
                  <div>
                    <div className="sq-dropdown-title">Books & Notes</div>
                    <div className="sq-dropdown-desc">Textbooks, lab manuals & notebooks</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">🔑</div>
                  <div>
                    <div className="sq-dropdown-title">Keys & Access</div>
                    <div className="sq-dropdown-desc">Keys, keychains, access cards and locker keys</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">⌚</div>
                  <div>
                    <div className="sq-dropdown-title">Jewellery & Watches</div>
                    <div className="sq-dropdown-desc">Watches, rings, bracelets and other valuables</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">🏃</div>
                  <div>
                    <div className="sq-dropdown-title">Sports & Equipment</div>
                    <div className="sq-dropdown-desc">Sports gear, lab equipment, calculators and instruments</div>
                  </div>
                </div>
                <div className="sq-dropdown-card sq-dropdown-card-static">
                  <div className="sq-dropdown-icon">📦</div>
                  <div>
                    <div className="sq-dropdown-title">Other Belongings</div>
                    <div className="sq-dropdown-desc">Umbrellas, bottles, lunch boxes and miscellaneous items</div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Solutions Dropdown */}
          <li className="sq-menu-item">
            <span className="sq-menu-link">
              Solutions <span className="sq-menu-chevron">▼</span>
            </span>
            <div className="sq-dropdown" style={{ minWidth: '380px' }}>
              <div className="sq-dropdown-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/report/lost" className="sq-dropdown-card">
                  <div className="sq-dropdown-icon">🎓</div>
                  <div>
                    <div className="sq-dropdown-title">For Students</div>
                    <div className="sq-dropdown-desc">Report lost items & get visual AI match suggestions instantly</div>
                  </div>
                </Link>
                <Link href="/hod" className="sq-dropdown-card">
                  <div className="sq-dropdown-icon">🏛</div>
                  <div>
                    <div className="sq-dropdown-title">For Faculty & HOD Desk</div>
                    <div className="sq-dropdown-desc">Departmental audit desk to verify item handovers safely</div>
                  </div>
                </Link>
              </div>
            </div>
          </li>

          {/* Direct Nav Links */}
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
        </ul>

        {/* Right Nav Action Buttons */}
        <div className="sq-nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '7px 16px',
                  borderRadius: '99px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: user.role === 'hod' ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : '#f1f5f9',
                  color: user.role === 'hod' ? '#09090b' : '#0f172a',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                {user.role === 'hod' ? '🛡 HOD:' : '👤'} {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="sq-btn sq-btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="sq-btn sq-btn-secondary">
                Log In
              </Link>
              <Link href="/signup" className="sq-btn sq-btn-primary">
                Get Started →
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
