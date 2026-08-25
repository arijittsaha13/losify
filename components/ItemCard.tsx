import Image from 'next/image';

export function ItemCard({ item }: { item: any }) {
  return (
    <div className="glass card item" style={{ contentVisibility: 'auto', containIntrinsicSize: '90px' }}>
      <Image className="thumb" src={item.image} width={62} height={62} alt={item.name} />
      <div style={{ flex: 1 }}>
        <b style={{ color: 'var(--sq-ink-primary)', fontSize: '1.05em' }}>{item.name}</b>
        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
          {item.color} · {item.location}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span className="pill">{item.status}</span>
        {item.confidence > 0 && (
          <div style={{ fontSize: 12, marginTop: 5, color: 'var(--sq-accent-blue)', fontWeight: 600 }}>
            {item.confidence}% match
          </div>
        )}
      </div>
    </div>
  );
}
