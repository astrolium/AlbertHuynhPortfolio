/* A board under inspection: the scan sweeps down with the scroll, and each
   defect gets bracketed as the line reaches it. */

const TRACES = [
  "M40 150 L40 118 L64 94 L150 94",
  "M40 196 L118 196 L140 216 L236 216",
  "M198 100 L226 100 L244 80 L262 80",
  "M330 88 L372 88 L392 108 L392 130",
  "M486 104 L556 104 L580 128 L580 202",
  "M238 254 L302 254 L322 272 L336 272",
  "M444 284 L470 284 L490 266",
  "M118 300 L118 336 L300 336 L320 316",
  "M394 196 L394 224 L372 244",
  "M562 246 L562 306 L502 306",
];

const PADS = [
  [40, 150], [150, 94], [236, 216], [262, 80], [392, 130],
  [580, 202], [336, 272], [490, 266], [320, 316], [502, 306],
];

const PARTS = [
  { x: 72, y: 96, w: 118, h: 88, pins: 6 },
  { x: 262, y: 60, w: 68, h: 44, pins: 4 },
  { x: 392, y: 130, w: 92, h: 64, pins: 5 },
  { x: 88, y: 250, w: 148, h: 40, pins: 8 },
  { x: 330, y: 244, w: 110, h: 72, pins: 5 },
  { x: 490, y: 240, w: 72, h: 52, pins: 4 },
];

/* `at` is where in the sweep the box is reached — it lights as the line lands. */
const FINDS = [
  { x: 262, y: 60, w: 68, h: 44, at: 0.2, score: "0.98", label: "Bridge" },
  { x: 392, y: 130, w: 92, h: 64, at: 0.44, score: "0.94", label: "Tombstone" },
  { x: 330, y: 244, w: 110, h: 72, at: 0.7, score: "0.91", label: "Void" },
];

function Brackets({ x, y, w, h, k = 16 }) {
  return (
    <path
      d={`M${x} ${y + k} L${x} ${y} L${x + k} ${y}
          M${x + w - k} ${y} L${x + w} ${y} L${x + w} ${y + k}
          M${x + w} ${y + h - k} L${x + w} ${y + h} L${x + w - k} ${y + h}
          M${x + k} ${y + h} L${x} ${y + h} L${x} ${y + h - k}`}
    />
  );
}

export default function DarwinAI() {
  return (
    <svg
      className="fig fig--board"
      viewBox="0 0 620 380"
      role="img"
      aria-label="A circuit board seen by a vision system. A scan line sweeps down the board and, as it passes each component, brackets close around three defects with confidence scores beside them."
    >
      <defs>
        <linearGradient id="dw-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tone)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--tone)" stopOpacity="0.3" />
        </linearGradient>
        <pattern id="dw-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" className="pcb-dot" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="620" height="380" className="pcb-board" />
      <rect x="0" y="46" width="620" height="334" fill="url(#dw-dots)" />

      <g className="pcb-trace" style={{ opacity: "var(--p1)" }}>
        {TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="pcb-pad" style={{ opacity: "var(--p1)" }}>
        {PADS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" />
        ))}
      </g>

      <g className="pcb-part" style={{ opacity: "var(--p2)" }}>
        {PARTS.map((part) => (
          <g key={`${part.x}-${part.y}`}>
            <rect x={part.x} y={part.y} width={part.w} height={part.h} rx="7" />
            {Array.from({ length: part.pins }, (_, i) => (
              <line
                key={i}
                className="pcb-pin"
                x1={part.x + (part.w / (part.pins + 1)) * (i + 1)}
                y1={part.y + part.h}
                x2={part.x + (part.w / (part.pins + 1)) * (i + 1)}
                y2={part.y + part.h + 7}
              />
            ))}
          </g>
        ))}
      </g>

      {/* the sweep itself */}
      <g className="pcb-scan" style={{ transform: "translateY(calc(46px + 338px * var(--p)))" }}>
        <rect x="0" y="-70" width="620" height="70" fill="url(#dw-scan)" />
        <line x1="0" y1="0" x2="620" y2="0" />
      </g>

      {FINDS.map((find) => (
        <g
          key={find.label}
          className="pcb-find"
          style={{
            "--v": `clamp(0, calc((var(--p) - ${find.at}) * 9), 1)`,
            transformOrigin: `${find.x + find.w / 2}px ${find.y + find.h / 2}px`,
          }}
        >
          <Brackets {...find} />
          <g className="pcb-score">
            <rect x={find.x} y={find.y - 37} width="126" height="27" rx="8" />
            <text x={find.x + 12} y={find.y - 18}>
              {find.label}
            </text>
            <text
              x={find.x + 114}
              y={find.y - 18}
              textAnchor="end"
              className="pcb-score__value"
            >
              {find.score}
            </text>
          </g>
        </g>
      ))}

      {/* which market we're looking at */}
      <g className="pcb-hud">
        <rect x="20" y="16" width="176" height="28" rx="9" className="pcb-hud__track" />
        <rect x="23" y="19" width="78" height="22" rx="7" className="pcb-hud__thumb" />
        <text x="62" y="35" textAnchor="middle" className="is-on">PCB</text>
        <text x="147" y="35" textAnchor="middle">Battery</text>
        <circle cx="504" cy="30" r="4.5" className="pcb-hud__live" style={{ opacity: "var(--p1)" }} />
        <text x="518" y="34">Inspecting</text>
      </g>
    </svg>
  );
}
