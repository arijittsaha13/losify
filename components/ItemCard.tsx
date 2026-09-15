import Image from 'next/image';
import { StatusTimeline } from './StatusTimeline';

export function ItemCard({ item, showFullTimeline = false }: { item: any; showFullTimeline?: boolean }) {
  if (!item) return null;
  const imageSrc = item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80';
  return (
    <div className="glass card item" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
        <Image className="thumb" src={imageSrc} width={62} height={62} alt={item.name || 'Item'} />
        <div style={{ flex: 1 }}>
          <b style={{ color: 'var(--sq-ink-primary)', fontSize: '1.05em' }}>{item.name || 'Item'}</b>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            {item.color || 'N/A'} · {item.location || 'Campus'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="pill">{item.status || 'REPORTED'}</span>
          {(item.confidence || 0) > 0 && (
            <div style={{ fontSize: 12, marginTop: 5, color: 'var(--sq-accent-blue)', fontWeight: 600 }}>
              {item.confidence}% match
            </div>
          )}
        </div>
      </div>

      <StatusTimeline status={item.status} confidence={item.confidence} compact={!showFullTimeline} />
    </div>
  );
}

