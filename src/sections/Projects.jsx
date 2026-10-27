import { useEffect, useState } from "react";
import { CaretDown, ChatCircleText } from "@phosphor-icons/react";
import data from "../data/index.json";
import Bubble from "../components/Bubble";
import { useReveal } from "../lib/motion";
import SectionPill from "../components/SectionPill";

/* Drawn, not a screenshot: a made-up tenant text and the draft the
 * automation hands back. No real names, numbers or lease text, ever. */
function TenantFigure({ label }) {
  return (
    <figure className="stage project__stage">
      <figcaption className="stage__chrome">{label}</figcaption>
      <div className="stage__screen imsg project__screen" aria-hidden="true">
        <p className="chat__stamp">
          <strong>Tenant</strong> Today 7:12 PM
        </p>
        <Bubble tail className="project__text">
          hi, the kitchen sink is draining really slowly. anything i should try?
        </Bubble>

        <div className="project__note">
          <p className="project__note-head">
            <ChatCircleText size={16} weight="fill" />
            <span>Shortcuts</span>
            <span className="project__note-time">now</span>
          </p>
          <p className="project__note-title">Draft reply</p>
          <p className="project__note-body">
            Thanks for letting me know. Please avoid using any chemical drain
            cleaners for now. I'll get back to you about next steps.
          </p>
          <p className="project__note-actions">
            <span>Edit</span>
            <span>Send</span>
          </p>
        </div>
      </div>
      <p className="sr-only">
        Illustration: a tenant asks about a slow kitchen drain, and a
        notification shows a draft reply waiting for the landlord to edit or
        send.
      </p>
    </figure>
  );
}

/* The fork in the middle of the flow: every branch ends at the landlord. */
function Flow({ flow }) {
  return (
    <div className="flow" role="group" aria-label="How a tenant text is handled">
      <ol className="flow__line">
        {flow.start.map((step) => (
          <li key={step} className="flow__node">
            {step}
          </li>
        ))}
        <li className="flow__node flow__node--decision">{flow.decision}</li>
      </ol>
      <ul className="flow__branches">
        {flow.branches.map((branch) => (
          <li key={branch.when} className="flow__branch">
            <span className="flow__when">{branch.when}</span>
            <span className="flow__node">{branch.then}</span>
          </li>
        ))}
      </ul>
      <ol className="flow__line">
        {flow.end.map((step) => (
          <li key={step} className="flow__node">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CaseSection({ section }) {
  return (
    <section className="case__section">
      <h4 className="case__heading">{section.heading}</h4>
      {section.body && <p>{section.body}</p>}
      {section.steps && (
        <ol className="case__steps">
          {section.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {section.flow && <Flow flow={section.flow} />}
      {section.items && (
        <ul className="case__items">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* A card on the page; the case study opens in place beneath it. Linking to
 * #<id> opens it too. */
function Project({ item }) {
  const copyRef = useReveal({ distance: 22 });
  const [open, setOpen] = useState(false);
  const headingId = `project-${item.id}-name`;
  const caseId = `${item.id}-case`;

  useEffect(() => {
    if (window.location.hash === `#${item.id}`) setOpen(true);
  }, [item.id]);

  return (
    <article className="project" id={item.id} aria-labelledby={headingId}>
      {/* The chapter is the card alone: its scroll timeline would otherwise
          stretch over the open case study and the figure would never finish. */}
      <div className="chapter">
        <div className="shell chapter__grid">
          <div className="chapter__copy reveal" ref={copyRef}>
            <h3 className="chapter__headline" id={headingId}>
              {item.title}
            </h3>
            <p className="chapter__role">
              {[item.type, item.period].filter(Boolean).join(" · ")}
            </p>
            <p className="chapter__blurb">{item.summary}</p>
            <p className="project__status">{item.status}</p>
            <ul className="chapter__tags">
              {item.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <button
              type="button"
              className="button button--quiet project__toggle"
              aria-expanded={open}
              aria-controls={caseId}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Hide the case study" : "Read the case study"}
              <CaretDown size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>

          <div className="chapter__stage">
            <TenantFigure label={item.stageLabel} />
          </div>
        </div>
      </div>

      <div className="shell case" id={caseId} hidden={!open}>
        {item.caseStudy.map((section) => (
          <CaseSection key={section.heading} section={section} />
        ))}
      </div>
    </article>
  );
}

export default function Projects() {
  const headRef = useReveal();

  return (
    <section className="work projects" id="projects" aria-labelledby="projects-title">
      <div className="shell work__head reveal" ref={headRef}>
        <SectionPill id="projects-title">Side projects</SectionPill>
      </div>

      {data.projects.map((item) => (
        <Project key={item.id} item={item} />
      ))}
    </section>
  );
}
