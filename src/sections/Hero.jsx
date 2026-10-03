import { useScrollTo } from "../lib/motion";
import Bubble from "../components/Bubble";
import LiquidGlass from "../components/LiquidGlass";

const NAV_OFFSET = 84;

export default function Hero() {
  const scrollTo = useScrollTo();

  return (
    <section className="hero" id="top">
      <div className="hero__content">
        <p className="eyebrow">Hey, I’m Albert</p>
        <h1 className="hero__title">
          Builder, explorer and{" "}
          <span className="hero__accent">creative</span>.
        </h1>
        <p className="hero__lede">Based anywhere. Usually one text away.</p>

        <div className="hero__actions">
          <a
            className="imsg button button--glass button--glass-tinted"
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              scrollTo("contact", NAV_OFFSET);
            }}
          >
            <LiquidGlass radius={8} bezel={10} scale={16} />
            <span className="button__label">Text me</span>
          </a>
          <a
            className="imsg button button--glass"
            href="#work"
            onClick={(event) => {
              event.preventDefault();
              scrollTo("work", NAV_OFFSET);
            }}
          >
            {/* The same glass as the nav: the globe bends through it. */}
            <LiquidGlass radius={8} bezel={10} scale={16} />
            <span className="button__label">See my work</span>
          </a>
        </div>
      </div>

      <div className="hero__portrait">
        <img
          className="hero__image"
          src="./img/hero.webp"
          width="1400"
          height="2100"
          alt="Portrait of Albert Huynh"
          fetchpriority="high"
        />
        {/* The first line of the conversation that the contact section
            finishes. Tapping it goes straight there. */}
        <div className="imsg hero__note">
          <Bubble
            as="a"
            href="#contact"
            tail
            className="hero__bubble"
            onClick={(event) => {
              event.preventDefault();
              scrollTo("contact", NAV_OFFSET);
            }}
          >
            hey 👋 i left you a message at the bottom
          </Bubble>
        </div>
      </div>
    </section>
  );
}
