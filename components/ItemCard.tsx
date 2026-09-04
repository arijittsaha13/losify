import Image from 'next/image';

export function ItemCard({ item }: { item: any }) {
  if (!item) return null;
  const imageSrc = item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80';
  return (
    <div className="glass card item" style={{ contentVisibility: 'auto', containIntrinsicSize: '90px' }}>
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
  );
}
