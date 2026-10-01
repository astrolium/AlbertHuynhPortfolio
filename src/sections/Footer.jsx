import { EnvelopeSimple, LinkedinLogo } from "@phosphor-icons/react";
import { useScrollTo } from "../lib/motion";
import { EMAIL, LINKEDIN } from "./Contact";
import Wordmark from "../components/Wordmark";

const LINKS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export default function Footer() {
  const scrollTo = useScrollTo();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <a
          className="footer__wordmark"
          href="#top"
          aria-label="Albert Huynh, back to top"
          onClick={(event) => {
            event.preventDefault();
            scrollTo("top", 0);
          }}
        >
          <Wordmark large />
        </a>

        <nav className="footer__links" aria-label="Footer">
          <ul>
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollTo(link.id, 84);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="footer__social">
          <li>
            <a
              className="icon-button"
              href={LINKEDIN}
              target="_blank"
              rel="noreferrer"
              aria-label="Albert on LinkedIn"
            >
              <LinkedinLogo size={18} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              className="icon-button"
              href={`mailto:${EMAIL}`}
              aria-label={`Email Albert at ${EMAIL}`}
            >
              <EnvelopeSimple size={18} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>

      <div className="shell footer__base">
        <p>Designed and built by Albert</p>
        <p>© {year}</p>
      </div>
    </footer>
  );
}
