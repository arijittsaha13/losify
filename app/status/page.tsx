'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyLostItems, getMyFoundItems, type Item } from '../../lib/itemsStore';
import { getCurrentUser, type User } from '../../lib/authStore';
import { StatusTimeline } from '../../components/StatusTimeline';
import Image from 'next/image';

export default function ReportStatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myLost, setMyLost] = useState<Item[]>([]);
  const [myFound, setMyFound] = useState<Item[]>([]);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    setUser(u);
    setMyLost(getMyLostItems(u.registerId, u.name));
    setMyFound(getMyFoundItems(u.registerId, u.name));
  }, [router]);

  if (!user) return null;

  const displayItems =
    filter === 'lost'
      ? myLost
      : filter === 'found'
      ? myFound
      : [...myLost, ...myFound];

  return (
    <main className="section" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="label">CAMPUS REPORT STATUS TRACKER</span>
          <h1 style={{ fontSize: '38px', marginTop: '4px' }}>My Report Status & Timeline</h1>
          <p className="muted" style={{ marginTop: '4px' }}>
            Track your submitted lost and found reports through every stage of recovery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? '#2563eb' : 'rgba(255, 255, 255, 0.7)',
              color: filter === 'all' ? '#ffffff' : '#0f172a',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            All Reports ({myLost.length + myFound.length})
          </button>
          <button
            className="btn"
            onClick={() => setFilter('lost')}
            style={{
              background: filter === 'lost' ? '#2563eb' : 'rgba(255, 255, 255, 0.7)',
              color: filter === 'lost' ? '#ffffff' : '#0f172a',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Lost ({myLost.length})
          </button>
          <button
            className="btn"
            onClick={() => setFilter('found')}
            style={{
              background: filter === 'found' ? '#2563eb' : 'rgba(255, 255, 255, 0.7)',
              color: filter === 'found' ? '#ffffff' : '#0f172a',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Found ({myFound.length})
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {displayItems.length === 0 ? (
          <div className="glass card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>No active reports found</h2>
            <p className="muted">You have not submitted any lost or found item reports yet.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <Link className="btn primary" href="/report/lost">
                + Report Lost Item
              </Link>
              <Link className="btn btn-glass" href="/report/found">
                + Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          displayItems.map((item) => (
            <div key={item.id} className="glass card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80'}
                  alt={item.name}
                  width={72}
                  height={72}
                  style={{ borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: item.id.startsWith('LS') ? '#eff6ff' : '#f0fdf4',
                        color: item.id.startsWith('LS') ? '#1d4ed8' : '#15803d',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.id.startsWith('LS') ? 'Lost Report' : 'Found Report'}
                    </span>
                    <span className="muted" style={{ fontSize: '12px' }}>ID: {item.id}</span>
                  </div>
                  <h3 style={{ margin: '4px 0', fontSize: '1.2em', fontWeight: 800 }}>{item.name}</h3>
                  <div className="muted" style={{ fontSize: '13px' }}>
                    Category: <b>{item.category}</b> · Location: <b>{item.location}</b> · Date: <b>{item.date}</b>
                  </div>
                </div>
              </div>

              {/* Full Timeline Component */}
              <StatusTimeline status={item.status} confidence={item.confidence} compact={false} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
