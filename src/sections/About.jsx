import { useReveal } from "../lib/motion";

export default function About() {
  const headRef = useReveal();
  const copyRef = useReveal({ delay: 90 });

  return (
    <section className="section" id="about">
      <div className="shell about">
        <div className="reveal about__head" ref={headRef}>
          <h2 className="section__title">How I got here</h2>
        </div>

        <div className="reveal about__copy" ref={copyRef}>
          <p className="prose">
            As a kid, I always wanted to be a firefighter. But as I grew up and
            got a reality check, I was lost and didn’t know what I wanted to
            do. My saving grace was I was always interested in technology. I
            loved how it made life easier; information was accessible at the
            palm of my hand, and with the right skills you could build anything
            you can dream up. I was introduced to the tech scene early in high
            school when I took business and technology.
          </p>
          <p className="prose">
            This sparked the interest and so I reached out and talked to people
            in tech and stumbled on Product Management. Through this I heard
            many stories of Product Managers impacting millions of people with
            projects they’d work on. Ever since coming to the University of
            Waterloo, I’ve been able to be a part of product teams in big
            organizations and finally understand what went on behind closed
            doors.
          </p>
        </div>
      </div>
    </section>
  );
}
