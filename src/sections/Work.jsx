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

/* The current role gets a full chapter; past roles follow as rows. */

/* One past role as a single scannable row: who, when, the headline, and
 * the joke off to the side. */
function PastRow({ item }) {
  const ref = useReveal({ distance: 16 });
  return (
    <li className="past__row reveal" ref={ref}>
      <div className="past__meta">
        <h3 className="chapter__name">
          <Logo item={item} scale={50} />
          <span className="sr-only">{item.company}</span>
        </h3>
        <p className="chapter__role">
          {[item.role, item.period].filter(Boolean).join(" · ")}
        </p>
      </div>
      <p className="past__headline">{item.headline}</p>
      <div className="imsg past__chat">
        <Bubble tail reaction={item.aside.reaction}>
          {item.aside.text}
        </Bubble>
      </div>
    </li>
  );
}

function Rhythm() {
  const [current, ...past] = data.portfolio;
  const labelRef = useReveal();
  return (
    <>
      <Chapter item={current} index={0} />
      <div className="shell past">
        <p className="eyebrow past__label reveal" ref={labelRef}>
          Before that
        </p>
        <ul className="past__list">
          {past.map((item) => (
            <PastRow key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </>
  );
}

export default function Work() {
  const headRef = useReveal();

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="shell work__head reveal" ref={headRef}>
        <SectionPill id="work-title">Where I’ve worked</SectionPill>
        <p className="work__lede">
          Four teams, four different problems: private markets, legal software,
          the warehouse floor, and a camera hunting defects on a production line.
        </p>
      </div>

      <Rhythm />
    </section>
  );
}
