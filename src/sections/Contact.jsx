import { useReveal } from "../lib/motion";

export const EMAIL = "alberthuynh2@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/albert-huynh/";

export default function Contact() {
  const ref = useReveal();

  return (
    <section className="section contact" id="contact">
      <div className="shell contact__inner reveal" ref={ref}>
        <p className="eyebrow">Let’s connect</p>
        <h2 className="section__title contact__title">
          Tell me what you’re building.
        </h2>
        <p className="prose contact__lede">
          The button below opens an email to me. No form, no fields, no
          newsletter.
        </p>

        <div className="contact__actions">
          <a className="button button--primary" href={`mailto:${EMAIL}`}>
            Email me
          </a>
          <a
            className="button button--quiet"
            href={LINKEDIN}
            target="_blank"
            rel="noreferrer"
          >
            Connect on LinkedIn
          </a>
        </div>

        <p className="contact__address">{EMAIL}</p>
      </div>
    </section>
  );
}
