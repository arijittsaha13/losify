'use client';
import { useState, useEffect } from 'react';
import { getLostItems, getFoundItems, getMatchedPairs, getGlobalStats, markMatchCollected, type Item, type MatchPair } from '../../lib/itemsStore';
import { getCurrentUser, login, type User } from '../../lib/authStore';

export default function Hod() {
  const [user, setUser] = useState<User | null>(null);
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalLost: 899, totalFound: 800, totalMatches: 768, accuracy: '96%' });
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('hod.losify@gmail.com');
  const [password, setPassword] = useState('hodpassword123');
  const [authError, setAuthError] = useState<string>();

  const loadData = () => {
    const u = getCurrentUser();
    setUser(u);
    if (u?.role === 'hod') {
      setLostItems(getLostItems());
      setFoundItems(getFoundItems());
      setPairs(getMatchedPairs());
      setGlobalStats(getGlobalStats());
    }
  };

  useEffect(() => {
    loadData();
    const handleAuthChange = () => loadData();
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleHodLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(undefined);
    try {
      const loggedUser = login(email, password, 'hod');
      if (loggedUser.role !== 'hod') {
        throw new Error('This account does not have HOD Administrative privileges.');
      }
      loadData();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'HOD Authentication failed');
    }
  };

  const handleCollect = (pairId: string) => {
    markMatchCollected(pairId);
    loadData();
  };

  if (!user || user.role !== 'hod') {
    return (
      <main className="form glass" style={{ maxWidth: 480, margin: '40px auto' }}>
        <span className="label" style={{ color: '#d93025' }}>🔒 ACCESS RESTRICTED</span>
        <h1>HOD Authentication Required</h1>
        <p className="muted">
          The HOD Control Center is restricted to authorized administration accounts. Please log in with your HOD credentials.
        </p>

        {authError && (
          <div className="glass card full" style={{ border: '1px solid #ff9999', padding: '12px 16px', margin: '10px 0' }}>
            <span style={{ color: '#d93025', fontWeight: 600 }}>⚠ {authError}</span>
          </div>
        )}

        <form className="fields" onSubmit={handleHodLogin}>
          <label className="full">
            HOD Admin Email
            <input
              type="email"
              required
              placeholder="e.g. hod.losify@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="full">
            Password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn primary full" type="submit" style={{ marginTop: 10 }}>
            Log In as HOD Admin →
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(16,52,86,0.1)' }}>
          <span className="label" style={{ fontSize: '0.78em' }}>DEFAULT HOD CREDENTIALS</span>
          <p style={{ fontSize: '0.85em', margin: '6px 0' }}>
            <b>Email:</b> <code>hod.losify@gmail.com</code>
            <br />
            <b>Password:</b> <code>hodpassword123</code>
          </p>
        </div>
      </main>
    );
  }

  const filteredPairs = pairs.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.lostItem.name.toLowerCase().includes(q) ||
      p.foundItem.name.toLowerCase().includes(q) ||
      p.foundItem.id.toLowerCase().includes(q) ||
      p.studentName.toLowerCase().includes(q) ||
      p.studentId.toLowerCase().includes(q)
    );
  });

  const completedCount = pairs.filter((p) => p.collected).length;

  const stats = [
    [String(globalStats.totalLost), 'Lost reports'],
    [String(globalStats.totalFound), 'Found reports'],
    [String(globalStats.totalMatches), 'AI matches'],
    [String(710 + completedCount), 'Completed collections'],
  ];

  return (
    <main className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="label">HOD CONTROL CENTER · AUTHENTICATED</span>
          <h1>Campus collection desk</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="pill" style={{ background: '#1479dc', color: '#fff' }}>
            🛡 {user.name} ({user.registerId})
          </span>
        </div>
      </div>

      <div className="grid four" style={{ marginTop: 15 }}>
        {stats.map((x) => (
          <div className="glass stat" key={x[1]}>
            <b>{x[0]}</b>
            <span className="muted">{x[1]}</span>
          </div>
        ))}
      </div>

      <div className="glass card" style={{ marginTop: 20 }}>
        <div className="actions" style={{ justifyContent: 'space-between' }}>
          <h2>Pending collections</h2>
          <input
            style={{ maxWidth: 220 }}
            placeholder="Search student or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Student (Claimant)</th>
                <th>AI match</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
                    No matched items found.
                  </td>
                </tr>
              ) : (
                filteredPairs.map((pair) => (
                  <tr key={pair.id}>
                    <td>
                      <b>{pair.foundItem.name || pair.lostItem.name}</b>
                      <br />
                      <span className="muted">
                        {pair.foundItem.id} · {pair.foundItem.location}
                      </span>
                    </td>
                    <td>
                      <b>{pair.studentName}</b>
                      <br />
                      <span className="muted">{pair.studentId}</span>
                    </td>
                    <td>
                      <span className="pill">{pair.confidence}% strong</span>
                    </td>
                    <td>{pair.collected ? 'COLLECTED' : 'READY FOR COLLECTION'}</td>
                    <td>
                      {!pair.collected ? (
                        <button onClick={() => handleCollect(pair.id)} className="btn primary">
                          Mark collected
                        </button>
                      ) : (
                        <span className="pill">Complete</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 20 }}>
        <div className="glass card">
          <h2>Recent lost reports</h2>
          {lostItems.map((x) => (
            <p key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
              <span>
                <b>{x.name}</b> <span className="muted" style={{ fontSize: '0.85em', marginLeft: 6 }}>({x.location})</span>
                <br />
                <span className="muted" style={{ fontSize: '0.78em' }}>By: {x.studentName || 'Student'} ({x.studentId || 'N/A'})</span>
              </span>
              <span className="pill">{x.status}</span>
            </p>
          ))}
        </div>
        <div className="glass card">
          <h2>Recent found reports</h2>
          {foundItems.map((x) => (
            <p key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
              <span>
                <b>{x.name}</b> <span className="muted" style={{ fontSize: '0.85em', marginLeft: 6 }}>({x.location})</span>
                <br />
                <span className="muted" style={{ fontSize: '0.78em' }}>By: {x.studentName || 'Student'} ({x.studentId || 'N/A'})</span>
              </span>
              <span className="pill">{x.status}</span>
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}