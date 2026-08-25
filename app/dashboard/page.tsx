'use client';
import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGlobalStats, getMyLostItems, getMyFoundItems, getFoundItems, type Item } from '../../lib/itemsStore';
import { getCurrentUser, type User } from '../../lib/authStore';
import { ItemCard } from '../../components/ItemCard';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myLostItems, setMyLostItems] = useState<Item[]>([]);
  const [myFoundItems, setMyFoundItems] = useState<Item[]>([]);
  const [recentFoundItems, setRecentFoundItems] = useState<Item[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalLost: 0, totalFound: 0, totalMatches: 0, accuracy: '100%' });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace('/login');
      return;
    }
    setUser(current);

    // Defer non-critical data processing to keep transition responsive
    startTransition(() => {
      const userLost = getMyLostItems(current.registerId, current.name);
      const userFound = getMyFoundItems(current.registerId, current.name);
      setMyLostItems(userLost);
      setMyFoundItems(userFound);
      setRecentFoundItems(getFoundItems());
      setGlobalStats(getGlobalStats());
    });
  }, [router]);

  if (!user) return null;

  const stats = [
    [String(myLostItems.length), 'My Lost Reports'],
    [String(myFoundItems.length), 'My Found Reports'],
    [String(globalStats.totalMatches), 'Campus AI Matches'],
    [globalStats.accuracy, 'App Matching Accuracy'],
  ];

  return (
    <main className="section" style={{ opacity: isPending ? 0.9 : 1, transition: 'opacity 0.15s ease' }}>
      <span className="label">WELCOME BACK, {user.name.toUpperCase()} ({user.registerId})</span>
      <h1 style={{ fontSize: 45, marginTop: 5 }}>Your campus hub</h1>

      <div className="grid four">
        {stats.map((x) => (
          <div className="glass stat" key={x[1]}>
            <b>{x[0]}</b>
            <span className="muted">{x[1]}</span>
          </div>
        ))}
      </div>

      <div className="grid two" style={{ marginTop: 22 }}>
        <section>
          <h2>My lost items</h2>
          {myLostItems.length > 0 ? (
            <div className="grid">
              {myLostItems.map((x) => (
                <ItemCard key={x.id} item={x} />
              ))}
            </div>
          ) : (
            <div className="glass card" style={{ padding: '24px', textAlign: 'center' }}>
              <p className="muted">No lost items reported yet under profile <b>{user.name}</b>.</p>
              <Link className="btn primary" href="/report/lost" prefetch={true} style={{ marginTop: 12, display: 'inline-block' }}>
                + Report a lost item
              </Link>
            </div>
          )}
          {myLostItems.length > 0 && (
            <Link className="btn" href="/report/lost" prefetch={true} style={{ marginTop: 14, display: 'inline-block' }}>
              + Report another lost item
            </Link>
          )}
        </section>

        <section>
          <div className="glass ai card">
            <span className="label" style={{ color: '#d5f5ff' }}>LOSIFY AI ENGINE</span>
            <h2>Campus Matching Active</h2>
            <p>
              AI is scanning <b>{globalStats.totalLost} lost items</b> against <b>{globalStats.totalFound} found reports</b> with a <b>{globalStats.accuracy} accuracy rate</b>.
            </p>
            <div className="progress" style={{ marginTop: 12 }}>
              <i style={{ width: globalStats.accuracy }} />
            </div>
            <Link className="btn" href="/report/found" prefetch={true} style={{ marginTop: 18, display: 'inline-block' }}>
              + Report a Found Item
            </Link>
          </div>

          <h2 style={{ marginTop: 20 }}>Campus recent found items</h2>
          {myFoundItems.length > 0 ? (
            <ItemCard item={myFoundItems[0]} />
          ) : recentFoundItems.length > 0 ? (
            <ItemCard item={recentFoundItems[0]} />
          ) : (
            <p className="muted">No found items registered yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
