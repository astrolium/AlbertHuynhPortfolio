import data from "../data/index.json";
import Bubble from "../components/Bubble";
import { useReveal } from "../lib/motion";

function Chapter({ item, index }) {
  const copyRef = useReveal({ distance: 22 });
  const headingId = `work-${item.id}-name`;
  const logoHeight = 62 / Math.sqrt(item.ratio);

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

export default function Work() {
  const headRef = useReveal();

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="shell work__head reveal" ref={headRef}>
        <h2 className="section__title" id="work-title">
          Where I’ve worked
        </h2>
        <p className="work__lede">
          Four teams, four different problems: private markets, legal software,
          the warehouse floor, and a camera hunting defects on a production line.
        </p>
      </div>

      {data.portfolio.map((item, index) => (
        <Chapter key={item.id} item={item} index={index} />
      ))}
    </section>
  );
}
