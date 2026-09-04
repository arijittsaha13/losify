'use client';
import Image from 'next/image';
import Link from 'next/link';

interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutAppModal({ isOpen, onClose }: AboutAppModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 30px 70px rgba(37, 99, 235, 0.25)',
          maxWidth: 'calc(100vw - 24px)',
          width: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 20px',
          color: '#0f172a',
          position: 'relative',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Image
              src="/images/logo-transparent.png"
              alt="Losify 3D Ribbon Logo"
              width={100}
              height={100}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 10px 25px rgba(37, 99, 235, 0.4))' }}
              priority
            />
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a', margin: '0 0 6px 0', fontFamily: 'Montserrat, var(--font-sans), sans-serif' }}>
            LOS<span style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IFY</span>
          </h2>
          <span style={{ fontSize: '12px', fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '4px 14px', borderRadius: '99px', letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid #bfdbfe' }}>
            Campus AI Lost &amp; Found System • v1.0
          </span>
        </div>

        {/* App Description */}
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, textAlign: 'center', marginBottom: '28px' }}>
          <strong>Losify</strong> is an advanced, campus-wide AI Lost &amp; Found network designed to seamlessly reconnect students and faculty with lost belongings using automated visual scanning and verified authentication.
        </p>

        {/* Key Details Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '24px', background: '#eff6ff', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              🤖
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                AI Visual &amp; Text Matching
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Our Gemini AI engine automatically analyzes images, item categories, color profiles, and location data to match lost reports against found listings instantly.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '24px', background: '#f0fdf4', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              🛡
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Verified Gmail &amp; HOD Control Desk
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Strict account verification for verified campus accounts. Dedicated HOD Admin desk for institutional oversight, item approvals, and official handovers.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '24px', background: '#faf5ff', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ⚡
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Instant Match Notifications
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Receive instant web alerts and status updates when your reported item is identified on campus or submitted to the central desk.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            Got It! Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
