import data from "../data/index.json";
import Bubble from "../components/Bubble";
import { useReveal } from "../lib/motion";
import SectionPill from "../components/SectionPill";

function Logo({ item, scale = 62 }) {
  const logoHeight = scale / Math.sqrt(item.ratio);
  return (
    <span
      className="chapter__logo"
      aria-hidden="true"
      style={{
        "--logo-h": `${logoHeight.toFixed(1)}px`,
        "--logo-w": `${(logoHeight * item.ratio).toFixed(1)}px`,
        WebkitMaskImage: `url(${item.logo})`,
        maskImage: `url(${item.logo})`,
      }}
    />
  );
}

function Chapter({ item, index }) {
  const copyRef = useReveal({ distance: 22 });
  const headingId = `work-${item.id}-name`;

  return (
    <section
      className="chapter"
      id={`work-${item.id}`}
      aria-labelledby={headingId}
      data-side={index % 2 ? "right" : "left"}
      data-layout={item.layout}
    >
      <div className="shell chapter__grid">
        <div className="chapter__copy reveal" ref={copyRef}>
          <h3 className="chapter__name" id={headingId}>
            <Logo item={item} />
            <span className="sr-only">{item.company}</span>
          </h3>

          <p className="chapter__headline">{item.headline}</p>
          <p className="chapter__role">
            {[item.role, item.period].filter(Boolean).join(" · ")}
          </p>

          <p className="chapter__blurb">{item.blurb}</p>
          <ul className="chapter__tags">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        {/* No figure: the visitor asks, Albert answers. The serious version
            is on the other side; this is the version Albert would text you. */}
        <div className="imsg chapter__chat">
          <p className="chat__stamp">
            <strong>{item.company}</strong> {item.period}
          </p>
          <Bubble sent tail className="chapter__ask">
            {item.ask}
          </Bubble>
          <Bubble tail reaction={item.aside.reaction} className="chapter__answer">
            {item.aside.text}
          </Bubble>
        </div>
      </div>
    </section>
  );
}

/* Past roles as a quiet row of logos. */
function Previously({ items }) {
  const ref = useReveal({ distance: 12 });
  return (
    <div className="shell previously reveal" ref={ref}>
      <p className="previously__label" id="previously-label">
        Previously
      </p>
      <ul className="previously__logos" aria-labelledby="previously-label">
        {items.map((item) => (
          <li key={item.id}>
            <Logo item={item} scale={44} />
            <span className="sr-only">{item.company}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The current role gets the chapter; past roles get the logo row. Their
 * full details stay in data/index.json. */
export default function Work() {
  const headRef = useReveal();
  const [current, ...past] = data.portfolio;

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="shell work__head reveal" ref={headRef}>
        <SectionPill id="work-title">Currently at</SectionPill>
      </div>

      <Chapter item={current} index={0} />
      <Previously items={past} />
    </section>
  );
}
