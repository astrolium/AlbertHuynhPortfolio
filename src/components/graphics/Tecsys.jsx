/* Before and after, on a wipe you drive with the scroll: the dense green-screen
   the warehouse floor actually had, and the redesign sliding over the top of it. */

const LEGACY_ROWS = Array.from({ length: 13 }, (_, row) => ({
  row,
  cells: [34, 58, 26, 72, 44].map(
    (base, cell) => base + ((row * 7 + cell * 13) % 5) * 6
  ),
  flagged: row % 5 === 2,
}));

const CARDS = [
  { y: 76, label: 132, sub: 84, status: "Staged", wide: false },
  { y: 158, label: 168, sub: 96, status: "Picking", wide: true },
  { y: 240, label: 118, sub: 74, status: "Packed", wide: false },
];

export default function Tecsys() {
  return (
    <svg
      className="fig fig--wipe"
      viewBox="0 0 620 380"
      role="img"
      aria-label="A before-and-after wipe. Underneath, the legacy green-screen terminal packed with rows of tiny data; sliding across it, the redesign: a short list of roomy task cards with clear labels and status."
    >
      <defs>
        <clipPath id="tec-wipe" clipPathUnits="userSpaceOnUse">
          <rect className="fig__wipe" x="0" y="0" width="620" height="380" style={{ "--w": "var(--p)" }} />
        </clipPath>
      </defs>

      {/* ---- what it was ---- */}
      <g className="tec-old">
        <rect x="0" y="0" width="620" height="380" className="tec-old__bg" />
        <rect x="0" y="0" width="620" height="24" className="tec-old__bar" />
        <text x="12" y="16" className="tec-old__chrome">WMS/3270 - INQ 04</text>
        <text x="608" y="16" textAnchor="end" className="tec-old__chrome">F1=HELP F3=EXIT</text>

        {[112, 214, 316, 418, 520].map((x) => (
          <line key={x} x1={x} y1="30" x2={x} y2="352" className="tec-old__rule" />
        ))}
        {["ORD", "SKU", "LOC", "QTY", "STS"].map((label, i) => (
          <text key={label} x={14 + i * 102} y="42" className="tec-old__head">
            {label}
          </text>
        ))}

        {LEGACY_ROWS.map(({ row, cells, flagged }) => (
          <g key={row} transform={`translate(0 ${54 + row * 23})`}>
            {cells.map((w, cell) => (
              <rect
                key={cell}
                x={14 + cell * 102}
                y="0"
                width={w}
                height="8"
                className={`tec-old__cell ${flagged && cell === 4 ? "is-flagged" : ""}`}
              />
            ))}
          </g>
        ))}

        <g className="tec-tag tec-tag--old">
          <rect x="452" y="336" width="144" height="28" rx="8" />
          <text x="524" y="355" textAnchor="middle">Legacy terminal</text>
        </g>
      </g>

      {/* ---- what it became ---- */}
      <g clipPath="url(#tec-wipe)">
        <rect x="0" y="0" width="620" height="380" className="tec-new__bg" />

        <text x="32" y="42" className="tec-new__title">Today’s picks</text>
        <g className="tec-new__count">
          <rect x="152" y="24" width="34" height="24" rx="8" />
          <text x="169" y="41" textAnchor="middle">14</text>
        </g>
        <circle cx="576" cy="36" r="14" className="tec-new__avatar" />

        {CARDS.map((card) => (
          <g key={card.y}>
            <rect
              x="28"
              y={card.y}
              width="564"
              height="70"
              rx="18"
              className={`tec-new__card ${card.wide ? "is-active" : ""}`}
            />
            <rect x="50" y={card.y + 18} width="34" height="34" rx="11" className="tec-new__icon" />
            <rect x="98" y={card.y + 22} width={card.label} height="10" rx="5" className="tec-new__line" />
            <rect x="98" y={card.y + 42} width={card.sub} height="8" rx="4" className="tec-new__line is-sub" />
            <g className="tec-new__status">
              <rect x="462" y={card.y + 21} width="108" height="28" rx="14" />
              <text x="516" y={card.y + 40} textAnchor="middle">{card.status}</text>
            </g>
          </g>
        ))}

        <g className="tec-tag tec-tag--new">
          <rect x="28" y="336" width="120" height="28" rx="8" />
          <text x="88" y="355" textAnchor="middle">Redesigned</text>
        </g>
      </g>

      {/* ---- the seam between them ---- */}
      <g className="fig__seam" style={{ transform: "translateX(calc(620px * var(--p)))" }}>
        <line x1="0" y1="0" x2="0" y2="380" />
        <circle cx="0" cy="190" r="17" />
        <path d="M-6 184 L-10 190 L-6 196 M6 184 L10 190 L6 196" />
      </g>
    </svg>
  );
}
