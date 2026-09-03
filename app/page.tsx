'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { lost } from '../lib/demo';
import { ItemCard } from '../components/ItemCard';
import { getCurrentUser, type User } from '../lib/authStore';
import { getGlobalStats } from '../lib/itemsStore';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLost: 899, totalFound: 800, totalMatches: 768, accuracy: '96%' });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setLoading(false);
    if (!current) {
      router.replace('/login');
    } else {
      setStats(getGlobalStats());
    }
  }, [router]);

  if (loading || !user) {
    return (
      <main className="sq-hero">
        <div className="glass" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '500px' }}>
          <span className="sq-tag">CAMPUS AUTHENTICATION</span>
          <h2 style={{ marginTop: '16px', fontSize: '28px', color: 'var(--sq-ink-primary)' }}>Redirecting to Login…</h2>
          <p style={{ color: 'var(--sq-ink-secondary)' }}>Please sign in to access campus Lost &amp; Found features.</p>
        </div>
      </main>
    );
  }

  const faqs = [
    {
      q: 'How does Losify match lost and found items?',
      a: 'Losify compares uploaded photos and text descriptions, extracting color, brand, item type, and location features to calculate a visual confidence score.'
    },
    {
      q: 'Is my personal contact details kept private?',
      a: 'Yes! Your contact information is never publicly displayed. All handovers and verification are routed safely through your department’s authorized HOD Desk.'
    },
    {
      q: 'What happens when a high-confidence match is found?',
      a: 'Both the owner and the reporter receive instant notification alerts with a secure verification code to claim the item at the designated HOD office.'
    },
    {
      q: 'Who can access the HOD Desk admin panel?',
      a: 'Only authorized campus faculty members and Department Heads with administrative credentials can access custody claim records.'
    }
  ];

  return (
    <main className="losify-home">
      {/* HERO SECTION */}
      <section className="sq-hero">
        <span className="sq-tag">● CAMPUS RECOVERY NETWORK · ONLINE</span>
        <h1 className="sq-hero-title">
          LOST DOESN’T HAVE TO MEAN GONE.
        </h1>
        <p className="sq-hero-subtitle">
          Losify blends visual AI intelligence, campus HOD verification, and real-time alerts to reunite lost belongings with their rightful owners in record time.
        </p>

        <div className="sq-hero-actions">
          <Link href="/report/lost" className="sq-btn sq-btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
            Report Lost Item →
          </Link>
          <Link href="/dashboard" className="sq-btn sq-btn-secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>
            Explore Live Matches
          </Link>
        </div>

        <div className="recovery-signal">
          <span><b>24/7</b> active reporting</span>
          <span><b>Secure</b> verified handovers</span>
        </div>

        {/* Hero Interactive Showcase Image Frame */}
        <div className="sq-showcase-frame">
          <Image
            src="/images/hero_showcase.jpg"
            alt="Losify AI Dashboard Interface"
            width={1200}
            height={675}
            className="sq-showcase-img"
            priority
          />
          <div className="sq-showcase-overlay-pill">
            <div style={{ background: '#38bdf8', width: 12, height: 12, borderRadius: '50%', boxShadow: '0 0 12px #38bdf8' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sq-ink-primary)' }}>Smart Matching Engine Active</div>
              <div style={{ fontSize: '12px', color: 'var(--sq-ink-muted)' }}>94.7% Match Confidence Rate • Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS RIBBON */}
      <section className="glass sq-stats-ribbon">
        <div>
          <span className="sq-stat-number">{stats.totalLost}</span>
          <span className="sq-stat-label">Lost Items Reported</span>
        </div>
        <div>
          <span className="sq-stat-number">{stats.totalFound}</span>
          <span className="sq-stat-label">Found Items Logged</span>
        </div>
        <div>
          <span className="sq-stat-number">{stats.totalMatches}</span>
          <span className="sq-stat-label">Successful Matches</span>
        </div>
        <div>
          <span className="sq-stat-number">{stats.accuracy}</span>
          <span className="sq-stat-label">AI Match Accuracy</span>
        </div>
      </section>

      {/* CATEGORIES PICTURE SHOWCASE */}
      <section>
        <div className="sq-section-header">
          <span className="sq-tag">BROWSE BY CATEGORY</span>
          <h2 className="sq-section-title">Explore Campus Item Showcases</h2>
          <p className="sq-section-desc">Instantly filter through reported items by category across all campus departments.</p>
        </div>

        <div className="sq-category-grid">
          {/* Category 1 */}
          <Link href="/dashboard?cat=electronics" className="sq-category-card">
            <Image
              src="/images/category_electronics.jpg"
              alt="Electronics Category"
              width={600}
              height={450}
              className="sq-category-img"
            />
            <div className="sq-category-content">
              <h3 className="sq-category-name">Laptops &amp; Gadgets</h3>
              <span className="sq-category-count">89 Active Listings →</span>
            </div>
          </Link>

          {/* Category 2 */}
          <Link href="/dashboard?cat=valuables" className="sq-category-card">
            <Image
              src="/images/category_valuables.jpg"
              alt="IDs and Valuables Category"
              width={600}
              height={450}
              className="sq-category-img"
            />
            <div className="sq-category-content">
              <h3 className="sq-category-name">IDs, Wallets &amp; Keys</h3>
              <span className="sq-category-count">45 Active Listings →</span>
            </div>
          </Link>

          {/* Category 3 */}
          <Link href="/dashboard?cat=bags" className="sq-category-card">
            <Image
              src="/images/category_bags.jpg"
              alt="Bags and Apparel Category"
              width={600}
              height={450}
              className="sq-category-img"
            />
            <div className="sq-category-content">
              <h3 className="sq-category-name">Bags &amp; Apparel</h3>
              <span className="sq-category-count">62 Active Listings →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* FEATURE MATRIX */}
      <section>
        <div className="sq-section-header">
          <span className="sq-tag">POWERFUL FEATURES</span>
          <h2 className="sq-section-title">Everything You Need to Find Anything</h2>
          <p className="sq-section-desc">Built for modern universities with privacy, accuracy, and efficiency at the core.</p>
        </div>

        <div className="sq-feature-grid">
          <div className="glass sq-feature-card">
            <div className="sq-feature-icon">👁</div>
            <h3 className="sq-feature-title">Smart Visual Matching</h3>
            <p className="sq-feature-text">Neural visual similarity scoring detects matching logos, colors, and physical item characteristics.</p>
          </div>

          <div className="glass sq-feature-card">
            <div className="sq-feature-icon">🛡</div>
            <h3 className="sq-feature-title">HOD Secure Custody</h3>
            <p className="sq-feature-text">Found items are stored safely with department heads until ownership is verified.</p>
          </div>

          <div className="glass sq-feature-card">
            <div className="sq-feature-icon">⚡</div>
            <h3 className="sq-feature-title">Instant Alerts</h3>
            <p className="sq-feature-text">Real-time notifications wake up as soon as a potential candidate item enters the database.</p>
          </div>

          <div className="glass sq-feature-card">
            <div className="sq-feature-icon">🔒</div>
            <h3 className="sq-feature-title">Privacy Protection</h3>
            <p className="sq-feature-text">Personal student details remain secret. Only authorized claims generate release tokens.</p>
          </div>

          <div className="glass sq-feature-card">
            <div className="sq-feature-icon">🗺</div>
            <h3 className="sq-feature-title">Campus Geo-Pinning</h3>
            <p className="sq-feature-text">Pin drop locations across libraries, science labs, food courts, and lecture halls.</p>
          </div>

          <div className="glass sq-feature-card">
            <div className="sq-feature-icon">📊</div>
            <h3 className="sq-feature-title">Real-Time Audit</h3>
            <p className="sq-feature-text">Track statistics on item recovery timelines, accuracy rates, and active claims.</p>
          </div>
        </div>
      </section>

      {/* LIVE MATCH SHOWCASE */}
      <section style={{ margin: '60px 0' }}>
        <div className="glass" style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'center' }}>
          <div>
            <span className="sq-tag">LIVE AI MATCHING DEMO</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '10px' }}>From “missing” to “back with you.”</h2>
            <p style={{ color: 'var(--sq-ink-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
              When a found item is submitted, smart visual matching immediately compares it against active lost item reports.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Link href="/report/lost" className="sq-btn sq-btn-primary">
                Report a Lost Item
              </Link>
              <Link href="/dashboard" className="sq-btn sq-btn-secondary">
                View Live Dashboard →
              </Link>
            </div>
          </div>

          <div>
            <ItemCard item={lost[0]} />
            <div className="glass" style={{ marginTop: '16px', padding: '20px', background: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <b style={{ color: 'var(--sq-ink-primary)', fontSize: '15px' }}>Match Confidence Score</b>
                <span style={{ color: 'var(--sq-accent-blue)', fontWeight: 800, fontSize: '16px' }}>92%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #3675ee, #81a9ff)' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--sq-ink-muted)', marginTop: '10px' }}>
                Matches: Black color, Nike branding, backpack category, library 2nd floor location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section>
        <div className="sq-section-header">
          <span className="sq-tag">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="sq-section-title">Everything You Need to Know</h2>
        </div>

        <div className="sq-faq-list">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="sq-faq-item"
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
            >
              <div className="sq-faq-question">
                <span>{faq.q}</span>
                <span>{expandedFaq === idx ? '−' : '+'}</span>
              </div>
              {expandedFaq === idx && (
                <div className="sq-faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SQUARESAPCE STYLE MEGA FOOTER */}
      <footer className="sq-footer">
        <div className="sq-footer-grid">
          <div>
            <Link href="/" className="brand">
              <Image
                src="/images/logo-transparent.png"
                alt="Losify Golden Logo"
                width={32}
                height={32}
                className="brand-logo-img"
              />
              <span className="brand-text">LOS<span className="brand-accent">IFY</span></span>
            </Link>
            <p style={{ color: 'var(--sq-ink-secondary)', fontSize: '14px', maxWidth: '300px', lineHeight: 1.6 }}>
              The intelligent campus recovery platform powered by AI vision and secure departmental custody.
            </p>
          </div>

          <div>
            <div className="sq-footer-col-title">Platform</div>
            <ul className="sq-footer-links">
              <li><Link href="/report/found">Found Item Reports</Link></li>
              <li><Link href="/dashboard">Live Dashboard</Link></li>
              <li><Link href="/notifications">Real-Time Alerts</Link></li>
              <li><Link href="/hod">HOD Security Desk</Link></li>
            </ul>
          </div>

          <div>
            <div className="sq-footer-col-title">Categories</div>
            <ul className="sq-footer-links">
              <li><Link href="/dashboard?cat=electronics">Electronics &amp; Laptops</Link></li>
              <li><Link href="/dashboard?cat=valuables">Student IDs &amp; Wallets</Link></li>
              <li><Link href="/dashboard?cat=bags">Backpacks &amp; Apparel</Link></li>
              <li><Link href="/dashboard?cat=books">Books &amp; Stationeries</Link></li>
            </ul>
          </div>

          <div>
            <div className="sq-footer-col-title">Campus Help</div>
            <ul className="sq-footer-links">
              <li><Link href="/report/lost">Report Lost Item</Link></li>
              <li><Link href="/report/found">Report Found Item</Link></li>
              <li><Link href="/login">Student Sign In</Link></li>
              <li><Link href="/signup">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="sq-footer-bottom">
          <div>© {new Date().getFullYear()} Losify Campus Recovery Systems. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Campus Terms</span>
            <span>Security Desk Policy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
