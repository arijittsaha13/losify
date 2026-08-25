'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../lib/authStore';

export default function Notifications() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="section">
      <span className="label">Notification center</span>
      <h1>Everything important, gently surfaced.</h1>
      <div className="glass notice">
        <b>🎉 Item Found</b>
        <p>Your black backpack appears to match a recently reported found item.</p>
        <b>Collect it from the HOD.</b>
        <span className="muted" style={{ float: 'right' }}>
          Just now
        </span>
      </div>
      <div className="glass notice">
        <b>Report is live</b>
        <p className="muted">We’re comparing your Blue Samsung Phone against new found-item reports.</p>
        <span className="muted">2 days ago</span>
      </div>
    </main>
  );
}
