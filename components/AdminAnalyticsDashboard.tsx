'use client';

export interface AnalyticsData {
  mostCommonCategories: { category: string; count: number; percentage: number }[];
  recoveryRates: { location: string; reported: number; recovered: number; rate: number }[];
  avgRecoveryDays: number;
  unclaimedCount: number;
  peakLossTimes: { label: string; count: number }[];
  peakLossDays: { day: string; count: number }[];
  totalReported: number;
  totalRecovered: number;
}

export function AdminAnalyticsDashboard({ data }: { data: AnalyticsData }) {
  if (!data) return null;

  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Headline Stats Row */}
      <div className="grid four">
        <div className="glass stat" style={{ borderLeft: '4px solid #2563eb' }}>
          <b className="stat-number">{data.avgRecoveryDays} days</b>
          <span className="muted stat-label">Average Time to Recover</span>
        </div>
        <div className="glass stat" style={{ borderLeft: '4px solid #eab308' }}>
          <b className="stat-number">{data.unclaimedCount}</b>
          <span className="muted stat-label">Unclaimed Found Items</span>
        </div>
        <div className="glass stat" style={{ borderLeft: '4px solid #16a34a' }}>
          <b className="stat-number">
            {data.totalReported > 0 ? `${Math.round((data.totalRecovered / data.totalReported) * 100)}%` : '100%'}
          </b>
          <span className="muted stat-label">Overall Campus Recovery Rate</span>
        </div>
        <div className="glass stat" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <b className="stat-number">{data.peakLossDays[0]?.day || 'Monday'}</b>
          <span className="muted stat-label">Peak Loss Day</span>
        </div>
      </div>

      <div className="grid two">
        {/* Most Common Lost Item Categories */}
        <div className="glass card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1em', fontWeight: 800 }}>Most Common Lost-Item Categories</h3>
            <span className="pill" style={{ fontSize: '11px' }}>Top Categories</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.mostCommonCategories.map((item) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>{item.category}</span>
                  <span className="muted">{item.count} items ({item.percentage}%)</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(203, 213, 225, 0.4)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Rate by Department / Location */}
        <div className="glass card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1em', fontWeight: 800 }}>Recovery Rate by Department / Location</h3>
            <span className="pill" style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d' }}>
              Campus Locations
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recoveryRates.map((loc) => (
              <div key={loc.location}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>{loc.location}</span>
                  <span style={{ color: loc.rate >= 70 ? '#16a34a' : '#2563eb' }}>
                    {loc.rate}% ({loc.recovered}/{loc.reported})
                  </span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(203, 213, 225, 0.4)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${loc.rate}%`,
                      background: loc.rate >= 70 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #2563eb, #60a5fa)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid two">
        {/* Peak Loss Times */}
        <div className="glass card">
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1em', fontWeight: 800 }}>Peak Loss Times</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {data.peakLossTimes.map((t) => (
              <div
                key={t.label}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>{t.count} reports</div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Loss Days */}
        <div className="glass card">
          <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1em', fontWeight: 800 }}>Peak Loss Days of the Week</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px', padding: '10px 0 0 0' }}>
            {data.peakLossDays.map((d) => {
              const maxCount = Math.max(...data.peakLossDays.map((x) => x.count), 1);
              const heightPct = Math.max(15, Math.round((d.count / maxCount) * 100));
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>{d.count}</div>
                  <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>{d.day.substring(0, 3)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
