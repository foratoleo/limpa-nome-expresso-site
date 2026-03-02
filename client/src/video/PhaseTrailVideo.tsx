import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, PHASES } from "./Config";

// Timing constants
const PHASE_DURATION = 4 * 30; // 4 seconds per phase
const TRAIL_DURATION = 1.5 * 30; // 1.5 seconds to fill trail
const FINALE_START = 24 * 30; // 24 seconds

// Icon components for each phase
const FolderIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill={color} />
    <path d="M12 11v6M9 14h6" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FileIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={color} />
    <polyline points="14,2 14,8 20,8" fill={COLORS.dark} />
    <line x1="8" y1="13" x2="16" y2="13" stroke={COLORS.dark} strokeWidth="2" />
    <line x1="8" y1="17" x2="12" y2="17" stroke={COLORS.dark} strokeWidth="2" />
  </svg>
);

const SendIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" fill={color} />
    <circle cx="11" cy="13" r="3" fill={COLORS.dark} />
  </svg>
);

const VideoIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="16" height="14" rx="2" fill={color} />
    <polygon points="7,8 14,11 7,14" fill={COLORS.dark} />
    <circle cx="18" cy="6" r="4" fill={color} opacity="0.7" />
  </svg>
);

const ShieldIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} />
    <path d="M9 12l2 2 4-4" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getIcon = (icon: string, color: string, size: number) => {
  switch (icon) {
    case "folder": return <FolderIcon color={color} size={size} />;
    case "file": return <FileIcon color={color} size={size} />;
    case "send": return <SendIcon color={color} size={size} />;
    case "video": return <VideoIcon color={color} size={size} />;
    case "shield": return <ShieldIcon color={color} size={size} />;
    default: return null;
  }
};

// Checkmark icon for completed phases
const CheckIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke={COLORS.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Particle effect for phase completion
const Particle: React.FC<{ x: number; y: number; delay: number; color: string }> = ({ x, y, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 200 },
  });

  const seed = delay * 0.5;
  const angle = seed * Math.PI * 2;
  const distance = interpolate(progress, [0, 1], [0, 80]);
  const scale = interpolate(progress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(${scale})`,
        opacity: progress > 0 ? 1 : 0,
      }}
    />
  );
};

// Ring burst effect for completion
const RingBurst: React.FC<{ x: number; y: number; progress: number; color: string }> = ({ x, y, progress, color }) => {
  const scale = interpolate(progress, [0, 1], [0.5, 2]);
  const opacity = interpolate(progress, [0, 0.5, 1], [0.8, 0.5, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 100,
        height: 100,
        borderRadius: "50%",
        border: `4px solid ${color}`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    />
  );
};

// Phase node component
const PhaseNode: React.FC<{
  phase: typeof PHASES[number];
  index: number;
  x: number;
  y: number;
  isActive: boolean;
  isCompleted: boolean;
  completionProgress: number;
  showParticles: boolean;
}> = ({ phase, index, x, y, isActive, isCompleted, completionProgress, showParticles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
    delay: 30 + index * 8,
  });

  const bounce = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 300 },
    delay: 30 + index * 8 + 5,
  });

  const pulseScale = isActive ? 1 + Math.sin(frame * 0.2) * 0.05 : 1;

  const checkScale = spring({
    frame: frame - (index * 60 + 90),
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  const ringProgress = spring({
    frame: frame - (index * 60 + 85),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${entryProgress * pulseScale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      {isCompleted && <RingBurst x={0} y={0} progress={ringProgress} color={phase.color} />}

      {showParticles && isCompleted && Array.from({ length: 8 }).map((_, i) => (
        <Particle key={i} x={0} y={0} delay={index * 60 + 90 + i * 2} color={phase.color} />
      ))}

      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          backgroundColor: isCompleted ? phase.color : isActive ? phase.color : COLORS.navy,
          border: `4px solid ${phase.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isActive
            ? `0 0 40px ${phase.color}90, 0 0 80px ${phase.color}40`
            : isCompleted
            ? `0 0 20px ${phase.color}60`
            : `0 0 10px ${COLORS.navy}80`,
          transform: `translateY(${interpolate(bounce, [0, 1], [20, 0])}px)`,
        }}
      >
        {isCompleted ? (
          <div style={{ transform: `scale(${Math.min(checkScale, 1)})` }}>
            <CheckIcon size={40} />
          </div>
        ) : (
          getIcon(phase.icon, isActive ? COLORS.dark : phase.color, 40)
        )}
      </div>

      <div style={{ fontSize: 14, fontWeight: "bold", color: isActive || isCompleted ? COLORS.gold : COLORS.textSecondary, letterSpacing: 2, opacity: entryProgress }}>
        FASE {phase.id}
      </div>

      <div style={{ fontSize: 18, fontWeight: "bold", color: isCompleted || isActive ? COLORS.textPrimary : COLORS.textSecondary, opacity: entryProgress }}>
        {phase.title}
      </div>

      {isActive && (
        <div style={{ fontSize: 14, color: COLORS.textSecondary, opacity: Math.sin(frame * 0.1) * 0.3 + 0.7, maxWidth: 120, textAlign: "center" }}>
          {phase.description}
        </div>
      )}
    </div>
  );
};

// Confetti for finale
const Confetti: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame: frame - delay, fps, config: { damping: 50, stiffness: 100 } });

  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% + ${Math.sin(delay * 0.5) * 100}px)`,
        top: interpolate(progress, [0, 1], [-100, 600]),
        width: 12,
        height: 12,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : 2,
        transform: `rotate(${delay * 20}deg)`,
        opacity: progress > 0 ? 0.8 : 0,
      }}
    />
  );
};

// Main video component
export const PhaseTrailVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const centerY = 540;
  const positions = [
    { x: 200, y: centerY + 50 },
    { x: 500, y: centerY - 30 },
    { x: 960, y: centerY - 60 },
    { x: 1420, y: centerY - 30 },
    { x: 1720, y: centerY + 50 },
  ];

  const currentPhaseIndex = Math.min(Math.floor(frame / PHASE_DURATION), 4);
  const phaseProgress = (frame % PHASE_DURATION) / PHASE_DURATION;
  const isFinale = frame >= FINALE_START;

  const finaleProgress = spring({
    frame: frame - FINALE_START,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(titleOpacity, [0, 1], [30, 0]);

  // Trail segment i connects phase i to phase i+1
  // It should fill DURING phase i, so it's complete when transitioning to phase i+1
  const getTrailProgress = (segmentIndex: number): number => {
    const phaseStart = segmentIndex * PHASE_DURATION;
    if (frame < phaseStart) return 0;
    if (frame >= (segmentIndex + 1) * PHASE_DURATION) return 1;
    const elapsed = frame - phaseStart;
    // Fill trail over the phase duration
    return Math.min(elapsed / (PHASE_DURATION * 0.7), 1); // 70% of phase time
  };

  // Build smooth bezier path for a single segment
  const buildSegmentPath = (fromIndex: number, toIndex: number) => {
    const curr = positions[fromIndex];
    const next = positions[toIndex];
    const midX = (curr.x + next.x) / 2;
    const cp1Y = curr.y - 20;
    const cp2Y = next.y + 20;
    return `M ${curr.x} ${curr.y} C ${midX} ${cp1Y} ${midX} ${cp2Y} ${next.x} ${next.y}`;
  };

  // Estimate segment length for strokeDasharray
  const getSegmentLength = (fromIndex: number, toIndex: number) => {
    const curr = positions[fromIndex];
    const next = positions[toIndex];
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    // Bezier curve is approximately 1.3x the straight line distance
    return Math.sqrt(dx * dx + dy * dy) * 1.3;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${COLORS.navy}50 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${COLORS.navy}30 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${COLORS.gold}10 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: isFinale ? interpolate(finaleProgress, [0, 0.3], [1, 0]) : titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h1 style={{ fontSize: 48, fontWeight: "bold", color: COLORS.textPrimary, marginBottom: 8 }}>
          Em <span style={{ color: COLORS.gold }}>5 fases</span> você pode ter
        </h1>
        <h2 style={{ fontSize: 60, fontWeight: "bold", color: COLORS.gold, textShadow: `0 0 40px ${COLORS.gold}40`, marginBottom: 16 }}>
          seu nome BLINDADO
        </h2>
        <p style={{ fontSize: 22, color: COLORS.textSecondary, opacity: 0.9 }}>
          Sem advogados. Sem consultorias. Você mesmo faz.
        </p>
      </div>

      {!isFinale && (
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {/* Background trail segments */}
          {positions.slice(0, -1).map((_, i) => {
            const segmentPath = buildSegmentPath(i, i + 1);
            return (
              <path
                key={`bg-${i}`}
                d={segmentPath}
                fill="none"
                stroke={`${COLORS.navy}60`}
                strokeWidth="6"
                strokeLinecap="round"
              />
            );
          })}
          {/* Animated trail segments */}
          {positions.slice(0, -1).map((_, i) => {
            const segmentProgress = getTrailProgress(i);
            if (segmentProgress <= 0) return null;

            const segmentPath = buildSegmentPath(i, i + 1);
            const segmentLength = getSegmentLength(i, i + 1);
            const isCompleted = currentPhaseIndex > i;
            const phase = PHASES[i];

            return (
              <path
                key={`trail-${i}`}
                d={segmentPath}
                fill="none"
                stroke={phase.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={segmentLength}
                strokeDashoffset={interpolate(segmentProgress, [0, 1], [segmentLength, 0])}
                style={{ filter: `drop-shadow(0 0 8px ${phase.color})` }}
              />
            );
          })}
        </svg>
      )}

      {!isFinale && PHASES.map((phase, index) => {
        const isActive = currentPhaseIndex === index;
        const isCompleted = currentPhaseIndex > index;
        return (
          <PhaseNode
            key={phase.id}
            phase={phase}
            index={index}
            x={positions[index].x}
            y={positions[index].y}
            isActive={isActive}
            isCompleted={isCompleted}
            completionProgress={isCompleted ? 1 : 0}
            showParticles={true}
          />
        )
      })}

      {!isFinale && PHASES.map((phase, index) => {
        const isActive = currentPhaseIndex === index;
        if (!isActive) return null;
        const explanationOpacity = spring({ frame, fps, config: { damping: 20, stiffness: 100 }, delay: index * PHASE_DURATION + 10 });

        return (
          <div key={`explanation-${phase.id}`} style={{ position: "absolute", bottom: 100, left: 100, right: 100, textAlign: "center", opacity: explanationOpacity }}>
            <div style={{ display: "inline-block", backgroundColor: `${phase.color}20`, border: `2px solid ${phase.color}`, borderRadius: 16, padding: "20px 40px", maxWidth: 1400 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: phase.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getIcon(phase.icon, COLORS.dark, 20)}
                </div>
                <span style={{ fontSize: 24, fontWeight: "bold", color: phase.color }}>Fase {phase.id}: {phase.title}</span>
              </div>
              <p style={{ fontSize: 20, color: COLORS.textPrimary, lineHeight: 1.5, margin: 0 }}>{phase.explanation}</p>
            </div>
          </div>
        )
      })}

      {isFinale && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: finaleProgress, transform: `scale(${interpolate(finaleProgress, [0, 0.5, 1], [0.8, 1.02, 1])})` }}>
          <div style={{ transform: `scale(${1 + Math.sin(frame * 0.1) * 0.03})` }}>
            <ShieldIcon color={COLORS.green} size={180} />
          </div>
          <h1 style={{ fontSize: 80, fontWeight: "bold", color: COLORS.gold, marginTop: 30, textShadow: `0 0 60px ${COLORS.gold}50` }}>BLINDAGEM</h1>
          <h2 style={{ fontSize: 56, fontWeight: "bold", color: COLORS.green, textShadow: `0 0 40px ${COLORS.green}40` }}>CONCLUÍDA!</h2>
          <p style={{ fontSize: 24, color: COLORS.textPrimary, marginTop: 24, opacity: interpolate(finaleProgress, [0.3, 0.6], [0, 1]) }}>Seu nome protegido por 12+ meses</p>
          <div style={{ display: "flex", gap: 20, marginTop: 30, opacity: interpolate(finaleProgress, [0.5, 0.8], [0, 1]) }}>
            {[COLORS.gold, COLORS.green, COLORS.blue].map((color, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.8 + Math.sin(frame * 0.15 + i) * 0.1})` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke={COLORS.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
          <a href="/guia" style={{ display: "inline-block", marginTop: 40, padding: "18px 56px", backgroundColor: COLORS.gold, color: COLORS.dark, fontSize: 24, fontWeight: "bold", borderRadius: 50, textDecoration: "none", opacity: interpolate(finaleProgress, [0.6, 0.9], [0, 1]), transform: `scale(${interpolate(finaleProgress, [0.6, 0.9], [0.9, 1])})` }}>
            Começar Agora
          </a>
        </div>
      )}

      {isFinale && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <Confetti key={i} delay={FINALE_START + i * 4} color={[COLORS.gold, COLORS.green, COLORS.blue][i % 3]} />
          ))}
        </div>
      )}

      <div style={{ position: "absolute", bottom: isFinale ? 30 : 20, left: 0, right: 0, textAlign: "center", fontSize: 14, color: COLORS.textSecondary, opacity: isFinale ? 0.6 : 0.5 }}>
        Baseado no Art. 43, 2 do CDC e Súmula 359 do STJ
      </div>
    </AbsoluteFill>
  );
};

export default PhaseTrailVideo;
