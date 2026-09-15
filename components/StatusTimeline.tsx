'use client';

export interface StatusTimelineProps {
  currentStage?: number; // 1 to 5
  status?: string;
  confidence?: number;
  className?: string;
  compact?: boolean;
}

export const TIMELINE_STEPS = [
  { stage: 1, label: 'Reported', desc: 'Item report received in system' },
  { stage: 2, label: 'Match found', desc: 'AI / System identified potential match' },
  { stage: 3, label: 'Verification pending', desc: 'Awaiting ownership & detail check' },
  { stage: 4, label: 'Ready for collection', desc: 'Verified & present at HOD desk' },
  { stage: 5, label: 'Collected', desc: 'Item successfully returned to owner' },
];

export function getStageFromStatus(status?: string, confidence?: number): number {
  if (!status) return 1;
  const s = status.toUpperCase();
  if (s === 'COLLECTED' || s === 'COMPLETED' || s === 'RETURNED') return 5;
  if (s === 'READY_FOR_COLLECTION' || s === 'READY FOR COLLECTION' || s === 'VERIFIED') return 4;
  if (s === 'VERIFYING' || s === 'VERIFICATION_PENDING' || s === 'PENDING VERIFICATION') return 3;
  if (s === 'MATCHED' || (confidence && confidence >= 60)) return 2;
  return 1;
}

export function StatusTimeline({ currentStage = 1, status, confidence, compact = false }: StatusTimelineProps) {
  const activeStage = status ? getStageFromStatus(status, confidence) : currentStage;


  if (compact) {
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '4px' }}>
          {TIMELINE_STEPS.map((step) => {
            const isDone = step.stage <= activeStage;
            const isCurrent = step.stage === activeStage;
            return (
              <div
                key={step.stage}
                title={`${step.label}: ${step.desc}`}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: isDone
                    ? isCurrent
                      ? 'linear-gradient(90deg, #2563eb, #3b82f6)'
                      : '#2563eb'
                    : 'rgba(148, 163, 184, 0.25)',
                  boxShadow: isCurrent ? '0 0 8px rgba(37, 99, 235, 0.6)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700 }}>
          <span style={{ color: activeStage >= 1 ? '#2563eb' : '#64748b' }}>
            Stage {activeStage}/5: {TIMELINE_STEPS[activeStage - 1].label}
          </span>
          <span style={{ color: '#64748b', fontSize: '10px' }}>
            {activeStage === 5 ? '✓ Complete' : 'In Progress'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sq-timeline-container"
      style={{
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        marginTop: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b' }}>
          Report Status Timeline
        </h4>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '12px',
            background: activeStage === 5 ? '#dcfce7' : '#dbeafe',
            color: activeStage === 5 ? '#15803d' : '#1d4ed8',
          }}
        >
          {TIMELINE_STEPS[activeStage - 1].label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = step.stage < activeStage;
          const isCurrent = step.stage === activeStage;
          const isLast = idx === TIMELINE_STEPS.length - 1;

          return (
            <div
              key={step.stage}
              style={{
                flex: 1,
                minWidth: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '15px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    background: step.stage < activeStage ? '#2563eb' : 'rgba(203, 213, 225, 0.5)',
                    zIndex: 1,
                    transition: 'background 0.3s ease',
                  }}
                />
              )}

              {/* Step indicator node */}
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isCurrent
                    ? '#2563eb'
                    : isDone
                    ? '#3b82f6'
                    : '#f1f5f9',
                  color: isDone || isCurrent ? '#ffffff' : '#64748b',
                  border: isCurrent
                    ? '3px solid #bfdbfe'
                    : isDone
                    ? '2px solid #60a5fa'
                    : '2px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px',
                  zIndex: 2,
                  boxShadow: isCurrent ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? '✓' : step.stage}
              </div>

              {/* Step Labels */}
              <div style={{ marginTop: '10px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: isCurrent ? 800 : isDone ? 700 : 600,
                    color: isCurrent ? '#1e293b' : isDone ? '#334155' : '#94a3b8',
                    lineHeight: 1.2,
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    marginTop: '3px',
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
