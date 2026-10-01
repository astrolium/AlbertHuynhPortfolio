/* Private-fund cashflow: capital calls below the line early, distributions
   above it later, and the fund's net curve climbing out of the J through the
   peer quartile band. Illustrative figures — the shape is the point. */

const CALLS = [46, 62, 74, 55, 40, 28, 16];
const DISTRIBUTIONS = [10, 24, 38, 32, 50, 64, 56, 78, 92];
const AXIS = 214;
const CURVE =
  "M66 208.0 C71.7 211.0 88.7 219.0 100 226.0 C111.3 233.0 122.7 243.0 134 250.0 C145.3 257.0 156.7 263.7 168 268.0 C179.3 272.3 190.7 275.0 202 276.0 C213.3 277.0 224.7 275.7 236 274.0 C247.3 272.3 258.7 269.7 270 266.0 C281.3 262.3 292.7 257.3 304 252.0 C315.3 246.7 326.7 240.3 338 234.0 C349.3 227.7 360.7 220.3 372 214.0 C383.3 207.7 394.7 203.0 406 196.0 C417.3 189.0 428.7 180.0 440 172.0 C451.3 164.0 462.7 155.3 474 148.0 C485.3 140.7 496.7 135.3 508 128.0 C519.3 120.7 530.7 111.7 542 104.0 C553.3 96.3 570.3 85.7 576 82.0";
const BAND =
  "M66 203.0 C71.7 205.8 88.7 213.3 100 219.9 C111.3 226.6 122.7 236.2 134 242.9 C145.3 249.6 156.7 255.9 168 259.9 C179.3 263.8 190.7 266.2 202 266.8 C213.3 267.4 224.7 265.8 236 263.8 C247.3 261.7 258.7 258.7 270 254.7 C281.3 250.7 292.7 245.3 304 239.7 C315.3 234.0 326.7 227.3 338 220.6 C349.3 213.9 360.7 206.2 372 199.6 C383.3 192.9 394.7 187.8 406 180.5 C417.3 173.2 428.7 163.8 440 155.4 C451.3 147.1 462.7 138.1 474 130.4 C485.3 122.7 496.7 117.0 508 109.3 C519.3 101.7 530.7 92.3 542 84.3 C553.3 76.3 570.3 65.1 576 61.2 L576 108.8 C570.3 112.2 553.3 122.1 542 129.3 C530.7 136.5 519.3 145.0 508 151.8 C496.7 158.7 485.3 163.6 474 170.4 C462.7 177.2 451.3 185.4 440 192.9 C428.7 200.5 417.3 209.0 406 215.5 C394.7 222.0 383.3 226.2 372 232.1 C360.7 237.9 349.3 244.8 338 250.6 C326.7 256.4 315.3 262.3 304 267.1 C292.7 272.0 281.3 276.5 270 279.7 C258.7 282.9 247.3 285.1 236 286.2 C224.7 287.4 213.3 288.3 202 286.8 C190.7 285.3 179.3 282.2 168 277.4 C156.7 272.5 145.3 265.4 134 257.9 C122.7 250.4 111.3 239.9 100 232.4 C88.7 225.0 71.7 216.2 66 213.0 Z";

const TICKS = [
  { y: 80, label: "2×" },
  { y: 147, label: "1×" },
  { y: 281, label: "−1×" },
];

export default function Addepar() {
  const bars = [
    ...CALLS.map((h, i) => ({ i, h, up: false })),
    ...DISTRIBUTIONS.map((h, i) => ({ i: i + CALLS.length, h, up: true })),
  ];

  return (
    <svg
      className="fig"
      viewBox="0 0 620 380"
      role="img"
      aria-label="A private-fund cashflow chart. Capital calls sit below the zero line through the early years, distributions rise above it later, and the fund's net curve climbs out of the J-curve through a shaded band of peer returns."
    >
      {/* legend */}
      <g className="fig__legend">
        <rect x="56" y="18" width="10" height="10" rx="3" className="fig__key-band" />
        <text x="72" y="27">Peer range</text>
        <rect x="160" y="22" width="14" height="2.5" rx="1.25" className="fig__key-line" />
        <text x="180" y="27">Net to LP</text>
      </g>

      {/* gridlines and the zero line the whole chart hangs off */}
      <g className="fig__grid" style={{ opacity: "var(--p1)" }}>
        {TICKS.map((tick) => (
          <line key={tick.y} x1="56" y1={tick.y} x2="596" y2={tick.y} />
        ))}
      </g>
      <g className="fig__ticks" style={{ opacity: "var(--p1)" }}>
        {TICKS.map((tick) => (
          <text key={tick.y} x="46" y={tick.y + 4} textAnchor="end">
            {tick.label}
          </text>
        ))}
        <text x="46" y={AXIS + 4} textAnchor="end">
          0
        </text>
      </g>

      <line
        className="fig__axis"
        x1="56"
        y1={AXIS}
        x2="596"
        y2={AXIS}
        style={{ transform: "scaleX(var(--p1))", transformOrigin: "56px center" }}
      />

      {/* the quartile band, opening out from the axis */}
      <path
        className="fig__band"
        d={BAND}
        style={{ transform: "scaleY(var(--p2))", transformOrigin: `center ${AXIS}px` }}
      />

      {/* calls and distributions, growing out of the axis in sequence */}
      <g>
        {bars.map((bar) => (
          <rect
            key={bar.i}
            className={`fig__bar ${bar.up ? "is-up" : ""}`}
            x={56 + 34 * bar.i}
            y={bar.up ? AXIS - bar.h : AXIS}
            width="20"
            height={bar.h}
            rx="3"
            style={{ "--d": (bar.i * 0.045).toFixed(3), transformOrigin: `center ${AXIS}px` }}
          />
        ))}
      </g>

      {/* and the line drawn over the top of them */}
      <path className="fig__line" d={CURVE} style={{ "--len": "620px" }} />

      <g className="fig__marker" style={{ opacity: "var(--p6)", transform: "scale(var(--p6))", transformOrigin: "540px 48px" }}>
        <circle className="fig__dot" cx="576" cy="82" r="5.5" />
        <rect x="470" y="24" width="90" height="30" rx="10" className="fig__pill" />
        <text x="515" y="43" textAnchor="middle" className="fig__pill-text">
          1.9× net
        </text>
      </g>
    </svg>
  );
}
