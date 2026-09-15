'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StatusTimeline } from './StatusTimeline';

export function ItemCard({ item, defaultExpanded = false }: { item: any; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!item) return null;
  const imageSrc = item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80';

  return (
    <div
      className="glass card item"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '18px',
        borderRadius: '16px',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', flexWrap: 'wrap' }}>
        <Image
          className="thumb"
          src={imageSrc}
          width={64}
          height={64}
          alt={item.name || 'Item'}
          style={{ borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: '180px' }}>
          <b style={{ color: 'var(--sq-ink-primary)', fontSize: '1.08em', fontWeight: 800 }}>{item.name || 'Item'}</b>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
            {item.color || 'N/A'} · {item.location || 'Campus'}
          </div>
          {item.date && (
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Reported: {item.date}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className="pill" style={{ fontSize: '11px', fontWeight: 700 }}>
            {item.status || 'REPORTED'}
          </span>
          {(item.confidence || 0) > 0 && (
            <div style={{ fontSize: 12, color: 'var(--sq-accent-blue)', fontWeight: 700 }}>
              {item.confidence}% AI match
            </div>
          )}
        </div>
      </div>

      {/* Embedded Status Timeline */}
      <StatusTimeline status={item.status} confidence={item.confidence} compact={!expanded} />

      {/* Action Links */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed rgba(203, 213, 225, 0.6)' }}>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {expanded ? '▲ Hide Full Timeline Steps' : '▼ View Full Timeline Steps'}
        </button>

        <Link
          href="/status"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#2563eb',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          Track All Status →
        </Link>
      </div>
    </div>
  );
}
