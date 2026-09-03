'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg, #ffffff)', color: 'var(--text-main, #0f172a)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Hero Header Section */}
        <div style={{ textAlign: 'center', padding: '40px 20px 50px', background: 'var(--card-sub-bg, #f8fafc)', borderRadius: '32px', border: '1px solid var(--card-border, #f1f5f9)', marginBottom: '50px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/images/logo-transparent.png"
              alt="Losify Blue Emblem"
              width={140}
              height={140}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 12px 30px rgba(37, 99, 235, 0.35))' }}
              priority
            />
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 500, letterSpacing: '-0.5px', color: '#2563eb', margin: '0 0 20px 0', fontFamily: 'Montserrat, var(--font-sans), sans-serif' }}>
            About LOSIFY
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-sub, #475569)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
            The intelligent campus recovery platform powered by AI vision, verified Google accounts, and secure departmental custody.
          </p>
        </div>

        {/* System Mission */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Our Campus Mission
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-sub, #334155)', lineHeight: 1.8, margin: '0 0 16px 0' }}>
            Losing valuable items on a bustling university campus can cause immense stress and lost productivity. <strong>Losify</strong> replaces physical noticeboards and informal messaging channels with a unified, automated, and secure digital platform.
          </p>
          <p style={{ fontSize: '16px', color: 'var(--text-sub, #334155)', lineHeight: 1.8, margin: 0 }}>
            By bringing AI-powered visual recognition together with official Head of Department (HOD) administrative oversight, Losify ensures every lost item is cataloged, verified, and safely returned to its rightful owner.
          </p>
        </section>

        {/* Feature Grid */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '28px', letterSpacing: '-0.5px' }}>
            Core Platform Capabilities
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--card-bg, #ffffff)', padding: '28px', borderRadius: '20px', border: '1px solid var(--card-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' }}>
                🤖
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 10px 0' }}>
                AI Visual Recognition
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-sub, #64748b)', lineHeight: 1.6, margin: 0 }}>
                Integrated Gemini AI vision automatically extracts visual features, color palettes, and object categories from item photos to achieve 100% campus matching accuracy.
              </p>
            </div>

            <div style={{ background: 'var(--card-bg, #ffffff)', padding: '28px', borderRadius: '20px', border: '1px solid var(--card-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' }}>
                🛡
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 10px 0' }}>
                Verified Google OAuth
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-sub, #64748b)', lineHeight: 1.6, margin: 0 }}>
                Strict security restricts access exclusively to verified <strong>@gmail.com</strong> accounts, preventing unauthorized claims and ensuring full accountability.
              </p>
            </div>

            <div style={{ background: 'var(--card-bg, #ffffff)', padding: '28px', borderRadius: '20px', border: '1px solid var(--card-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' }}>
                ⚖
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 10px 0' }}>
                HOD Control Desk
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-sub, #64748b)', lineHeight: 1.6, margin: 0 }}>
                Institutional security dashboard for department heads to manage physical inventory, verify ownership proofs, and log official handover records.
              </p>
            </div>

            <div style={{ background: 'var(--card-bg, #ffffff)', padding: '28px', borderRadius: '20px', border: '1px solid var(--card-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' }}>
                🔔
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 10px 0' }}>
                Real-Time Match Alerts
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-sub, #64748b)', lineHeight: 1.6, margin: 0 }}>
                Students receive instant alerts and notifications as soon as an item matching their lost report is uploaded by any finder on campus.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section style={{ background: 'var(--card-sub-bg, #f8fafc)', padding: '36px', borderRadius: '24px', border: '1px solid var(--card-border, #f1f5f9)', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '24px', textAlign: 'center' }}>
            How Losify Works Step-by-Step
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', background: 'var(--card-bg, #ffffff)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid #bfdbfe' }}>
                1
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 6px 0' }}>Report Item</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-sub, #64748b)', margin: 0, lineHeight: 1.5 }}>
                Submit a report with location details, date, and optional photo.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', background: 'var(--card-bg, #ffffff)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid #bfdbfe' }}>
                2
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 6px 0' }}>AI Visual Scan</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-sub, #64748b)', margin: 0, lineHeight: 1.5 }}>
                Losify AI automatically scans new reports against existing database.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', background: 'var(--card-bg, #ffffff)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid #bfdbfe' }}>
                3
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: '0 0 6px 0' }}>HOD Verification</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-sub, #64748b)', margin: 0, lineHeight: 1.5 }}>
                Verify claim at the central desk &amp; safely claim your item.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Bottom Bar */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" prefetch={true} style={{ padding: '14px 28px', background: '#2563eb', color: '#ffffff', borderRadius: '12px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }}>
            Go to Live Dashboard →
          </Link>
          <Link href="/report/lost" prefetch={true} style={{ padding: '14px 28px', background: 'var(--card-bg, #ffffff)', color: 'var(--text-main, #0f172a)', border: '1.5px solid var(--card-border, #cbd5e1)', borderRadius: '12px', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
            + Report Lost Item
          </Link>
        </div>
      </main>
    </div>
  );
}
