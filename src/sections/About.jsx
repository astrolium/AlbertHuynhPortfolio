import { useReveal } from "../lib/motion";
import SectionPill from "../components/SectionPill";

export default function About() {
  const headRef = useReveal();
  const copyRef = useReveal({ delay: 90 });

  return (
    <section className="section" id="about">
      <div className="shell about">
        <div className="reveal about__head" ref={headRef}>
          <SectionPill>How I got here</SectionPill>
        </div>

        <div className="reveal about__copy" ref={copyRef}>
          <p className="prose">
            I’ve always been someone who likes to build and create things.
            Growing up, it was always “let’s build Legos,” or “let’s make a
            fort,” or “let me grab the camera and make some memories.” If
            something could be made, I wanted to be the one making it.
          </p>
          <p className="prose">
            Technology turned out to be the biggest box of Legos there is. A
            business and technology class in high school showed me that with
            the right skills, you could build almost anything you could dream
            up, and put it in millions of people’s hands. So I started
            reaching out to people in tech, and that’s how I stumbled on
            product management: the people who decide what gets built, and
            why.
          </p>
          <p className="prose">
            At the University of Waterloo, I’ve gotten to join product teams at
            big organizations and finally see what goes on behind closed
            doors. Same kid, bigger forts.
          </p>
        </div>
      </div>
    </section>
  );
}
