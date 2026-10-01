import { useScrollTo } from "../lib/motion";
import { EMAIL } from "./Contact";

const NAV_OFFSET = 84;

export default function Hero() {
  const scrollTo = useScrollTo();

  return (
    <section className="hero" id="top">
      <div className="hero__content">
        <p className="eyebrow">Hey, I’m Albert</p>
        <h1 className="hero__title">
          Product manager, explorer and{" "}
          <span className="hero__accent">creative</span>.
        </h1>
        <p className="hero__lede">Based anywhere.</p>

        <div className="hero__actions">
          <a className="button button--primary" href={`mailto:${EMAIL}`}>
            Email me
          </a>
          <a
            className="button button--quiet"
            href="#work"
            onClick={(event) => {
              event.preventDefault();
              scrollTo("work", NAV_OFFSET);
            }}
          >
            See my work
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
      </div>
    </section>
  );
}
