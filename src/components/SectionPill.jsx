import LiquidGlass from "./LiquidGlass";

/* A section's name as a small liquid-glass pill, the same glass as the nav
 * and the chat composer, in place of a large serif title. */
export default function SectionPill({ children, id }) {
  return (
    <h2 className="imsg section-pill" id={id}>
      <LiquidGlass bezel={10} scale={14} />
      <span className="section-pill__text">{children}</span>
    </h2>
  );
}
