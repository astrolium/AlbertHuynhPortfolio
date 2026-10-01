/* A launch curve: adoption climbing, with the two launches that moved it
   flagged on the way up. */

const LINE =
  "M56 296.0 C67.0 294.7 100.0 292.0 122 288.0 C144.0 284.0 166.0 276.3 188 272.0 C210.0 267.7 232.0 268.7 254 262.0 C276.0 255.3 298.0 241.0 320 232.0 C342.0 223.0 364.0 219.0 386 208.0 C408.0 197.0 430.0 180.3 452 166.0 C474.0 151.7 494.0 136.3 518 122.0 C542.0 107.7 583.0 87.0 596 80.0";
const AREA = `${LINE} L596 320 L56 320 Z`;

const FLAGS = [
  { x: 254, y: 262, label: "Clio Manage", stage: "var(--p4)" },
  { x: 518, y: 122, label: "Personal Injury", stage: "var(--p6)", accent: true },
];

export default function Clio() {
  return (
    <svg
      className="fig"
      viewBox="0 0 620 380"
      role="img"
      aria-label="An adoption curve climbing from left to right, with two launch milestones flagged along it: Clio Manage partway up, and the new Personal Injury product near the top."
    >
      <defs>
        <linearGradient id="clio-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tone)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--tone)" stopOpacity="0" />
        </linearGradient>
        {/* The fill is wiped in from the left rather than faded in, so it
            reads as the curve filling behind itself. */}
        <clipPath id="clio-wipe" clipPathUnits="userSpaceOnUse">
          <rect className="fig__wipe" x="0" y="0" width="620" height="380" style={{ "--w": "var(--p3)" }} />
        </clipPath>
      </defs>

      <g className="fig__legend">
        <text x="56" y="27">Weekly active firms</text>
      </g>

      <g className="fig__grid" style={{ opacity: "var(--p1)" }}>
        {[96, 152, 208, 264, 320].map((y) => (
          <line key={y} x1="56" y1={y} x2="596" y2={y} />
        ))}
      </g>

      <g clipPath="url(#clio-wipe)">
        <path d={AREA} fill="url(#clio-fill)" />
      </g>
      <path className="fig__line" d={LINE} style={{ "--len": "600px" }} />

      {FLAGS.map((flag) => (
        <g
          key={flag.label}
          className={`fig__flag ${flag.accent ? "is-accent" : ""}`}
          style={{ opacity: flag.stage, transform: `scale(${flag.accent ? "var(--p6)" : "var(--p4)"})`, transformOrigin: `${flag.x}px ${flag.y}px` }}
        >
          <line x1={flag.x} y1={flag.y} x2={flag.x} y2={flag.y - 44} />
          <circle cx={flag.x} cy={flag.y} r="5" />
          <rect
            x={flag.x - 58}
            y={flag.y - 72}
            width="116"
            height="28"
            rx="9"
            className="fig__pill"
          />
          <text x={flag.x} y={flag.y - 53} textAnchor="middle" className="fig__pill-text">
            {flag.label}
          </text>
        </g>
      ))}

      {/* the quarter the whole plan was built around */}
      <g className="fig__stamp" style={{ opacity: "var(--p2)" }}>
        <rect x="424" y="14" width="172" height="30" rx="10" />
        <text x="510" y="33" textAnchor="middle">
          2024 go-to-market
        </text>
      </g>
    </svg>
  );
}
