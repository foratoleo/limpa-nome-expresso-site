interface PhaseTrailProps {
  currentPhase?: number;
}

const phases = [
  { number: 1, title: "Documentos", color: "#d39e17", icon: "file" },
  { number: 2, title: "Peticao", color: "#60a5fa", icon: "scales" },
  { number: 3, title: "Protocolo", color: "#22c55e", icon: "send" },
  { number: 4, title: "Balcao Virtual", color: "#d39e17", icon: "video" },
  { number: 5, title: "Acompanhar", color: "#22c55e", icon: "shield" },
];

const phaseIcons: Record<string, React.ReactNode> = {
  file: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  ),
  scales: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18M5 7l7-4 7 4M5 7v5a7 7 0 0 0 14 0V7" />
    </svg>
  ),
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22,2 15,22 11,13 2,9" />
    </svg>
  ),
  video: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23,7 16,12 23,17 23,7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9,12 11,14 15,10" />
    </svg>
  ),
};

export function PhaseTrail({ currentPhase = 1 }: PhaseTrailProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] px-4">
        {/* SVG Curved Path */}
        <svg
          viewBox="0 0 800 120"
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background curved path */}
          <path
            d="M 40 60
               Q 120 20, 200 60
               Q 280 100, 360 60
               Q 440 20, 520 60
               Q 600 100, 680 60
               L 760 60"
            stroke="rgba(211, 158, 23, 0.2)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Progress curved path (up to current phase) */}
          <path
            d="M 40 60
               Q 120 20, 200 60
               Q 280 100, 360 60
               Q 440 20, 520 60
               Q 600 100, 680 60
               L 760 60"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${(currentPhase / 6) * 720} 720`}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d39e17" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Phase nodes */}
          {phases.map((phase, index) => {
            const xPositions = [40, 200, 360, 520, 680];
            const yPositions = [60, 60, 60, 60, 60];
            const isActive = phase.number <= currentPhase;
            const isCurrent = phase.number === currentPhase;

            return (
              <g key={phase.number}>
                {/* Outer ring for current phase */}
                {isCurrent && (
                  <circle
                    cx={xPositions[index]}
                    cy={yPositions[index]}
                    r="28"
                    stroke={phase.color}
                    strokeWidth="2"
                    fill="none"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values="24;28;24"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0.2;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={xPositions[index]}
                  cy={yPositions[index]}
                  r="20"
                  fill={isActive ? phase.color : "rgba(22, 40, 71, 0.95)"}
                  stroke={phase.color}
                  strokeWidth="2"
                />

                {/* Phase number or checkmark */}
                {isActive ? (
                  phase.number < currentPhase ? (
                    <text
                      x={xPositions[index]}
                      y={yPositions[index] + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#12110d"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      &#10003;
                    </text>
                  ) : (
                    <text
                      x={xPositions[index]}
                      y={yPositions[index] + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#12110d"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {phase.number}
                    </text>
                  )
                ) : (
                  <text
                    x={xPositions[index]}
                    y={yPositions[index] + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#64748b"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {phase.number}
                  </text>
                )}

                {/* Phase label */}
                <text
                  x={xPositions[index]}
                  y={yPositions[index] + 40}
                  textAnchor="middle"
                  fill={isActive ? "#f1f5f9" : "#64748b"}
                  fontSize="11"
                  fontFamily="'Public Sans', sans-serif"
                  fontWeight="500"
                >
                  {phase.title}
                </text>
              </g>
            );
          })}

          {/* Final destination: Blindagem Concluida */}
          <g>
            {/* Glow effect */}
            <circle
              cx={760}
              cy={60}
              r="24"
              fill="url(#shieldGlow)"
            />
            <defs>
              <radialGradient id="shieldGlow">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Shield icon background */}
            <circle
              cx={760}
              cy={60}
              r="18"
              fill={currentPhase >= 5 ? "#22c55e" : "rgba(22, 40, 71, 0.95)"}
              stroke={currentPhase >= 5 ? "#22c55e" : "rgba(34, 197, 94, 0.3)"}
              strokeWidth="2"
            />

            {/* Shield icon */}
            <path
              d="M 760 48 L 760 72 M 752 54 L 760 62 L 770 52"
              stroke={currentPhase >= 5 ? "#12110d" : "#64748b"}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              transform="translate(0, -2)"
            />

            {/* Label */}
            <text
              x={760}
              y={100}
              textAnchor="middle"
              fill={currentPhase >= 5 ? "#22c55e" : "#64748b"}
              fontSize="9"
              fontFamily="'Public Sans', sans-serif"
              fontWeight="600"
            >
              BLINDAGEM
            </text>
            <text
              x={760}
              y={112}
              textAnchor="middle"
              fill={currentPhase >= 5 ? "#22c55e" : "#64748b"}
              fontSize="9"
              fontFamily="'Public Sans', sans-serif"
              fontWeight="600"
            >
              CONCLUIDA
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default PhaseTrail;
