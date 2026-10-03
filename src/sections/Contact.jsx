import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import Bubble from "../components/Bubble";
import LiquidGlass from "../components/LiquidGlass";
import { usePrefersReducedMotion } from "../lib/motion";

export const EMAIL = "alberthuynh2@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/albert-huynh/";

/* The thread reads top to bottom as the visitor scrolls. A string is a
 * timestamp; everything else is a bubble from Albert. `tail` marks the last
 * bubble in a run, the one iMessage draws the little hook on. */
const THREAD = [
  "Today 9:41 AM",
  { text: "oh hey, you made it to the bottom 👋" },
  { text: "most people bounce right after the hero photo", tail: true, reaction: "😂" },
  "Today 9:42 AM",
  { text: "quick recap in case you scrolled fast:" },
  { text: "took a whole product line to market at clio" },
  { text: "made warehouse software people had been stuck with for years actually usable" },
  { text: "pointed AI cameras at circuit boards to see if they’d hold up", reaction: "👀" },
  { text: "the circuit boards did not enjoy it", tail: true },
  "Today 9:44 AM",
  { text: "these days i’m at addepar, digging through private-fund data for the good stories" },
  { text: "pm by day. spreadsheet enjoyer by night", tail: true, reaction: "📈" },
  "Today 9:45 AM",
  {
    text: (
      <>
        if you’re more of a linkedin person,{" "}
        <a href={LINKEDIN} target="_blank" rel="noreferrer">
          that works too
        </a>
      </>
    ),
  },
  { text: "but honestly? i answer email faster than a slack huddle invite", tail: true },
];

const QUESTION = "where should i email you?";

const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

/* Netlify picks up the static twin of this form in public/index.html at build
 * time; a POST to the site root with the same form-name lands in its inbox. */
async function deliver(email) {
  const body = new URLSearchParams({ "form-name": "contact", email, "bot-field": "" });
  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Form post failed: ${response.status}`);
}

function Typing() {
  return (
    <div className="bubble bubble--typing bubble--arrive" aria-label="Albert is typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* "Albert is typing…" for a beat, then the line itself. */
function useTypedIn(trigger, delay, reduced) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!trigger) return undefined;
    if (reduced) {
      setShown(true);
      return undefined;
    }
    const timer = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(timer);
  }, [trigger, delay, reduced]);
  return shown;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* iMessage pacing, so a reply feels like a person and not a server: a beat
 * after the send settles, the dots; a couple of seconds later, the words. */
const REPLY_PAUSE = 900;
const REPLY_TYPING = 2200;
const MIN_SENDING = 1400;

/* After this many misses, stop asking for retries and hand over the address. */
const GIVE_UP_AFTER = 2;

/* Albert's answer to one send. Failures escalate: the first asks for another
 * go, the next gives up gracefully and points at plain email. */
function Reply({ send, failures }) {
  if (send.status === "delivered") {
    return (
      <>
        <Bubble className="bubble--reply">got it 🙌</Bubble>
        <Bubble tail className="bubble--reply bubble--later">
          that went straight to my real inbox, not the void. talk soon
        </Bubble>
      </>
    );
  }
  if (failures < GIVE_UP_AFTER) {
    return (
      <Bubble tail className="bubble--reply">
        hm, my phone’s being dramatic. mind trying that again?
      </Bubble>
    );
  }
  return (
    <>
      <Bubble className="bubble--reply">ok yeah, it’s not happening 😅</Bubble>
      <Bubble tail className="bubble--reply bubble--later">
        just email me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and i’ll get back to you
      </Bubble>
    </>
  );
}

export default function Contact() {
  const reduced = usePrefersReducedMotion();
  const askRef = useRef(null);
  const [asking, setAsking] = useState(false);
  const [value, setValue] = useState("");
  // Every send stays in the thread, oldest first:
  // { email, status: sending | delivered | failed, attempt, done }
  const [sends, setSends] = useState([]);
  const sent = sends[sends.length - 1];
  const [reply, setReply] = useState("none"); // none | typing | shown
  const [nudge, setNudge] = useState(false);

  const asked = useTypedIn(asking, 1500, reduced);

  const status = sent?.status;
  const attempt = sent?.attempt;
  useEffect(() => {
    setReply("none");
    if (!status || status === "sending") return undefined;
    if (reduced) {
      setReply("shown");
      return undefined;
    }
    const typing = setTimeout(() => setReply("typing"), REPLY_PAUSE);
    const shown = setTimeout(() => setReply("shown"), REPLY_PAUSE + REPLY_TYPING);
    return () => {
      clearTimeout(typing);
      clearTimeout(shown);
    };
  }, [status, attempt, reduced]);

  // The question waits until the visitor is actually there to read it.
  useEffect(() => {
    const el = askRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setAsking(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAsking(true);
          observer.disconnect();
        }
      },
      { threshold: 1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const valid = EMAIL_PATTERN.test(value.trim());
  const failures = sends.filter((item) => item.status === "failed").length;
  const gaveUp = failures >= GIVE_UP_AFTER;
  // Also wait for Albert to finish answering before another go.
  const replying = sent?.status === "failed" && reply !== "shown";
  const locked = (sent && sent.status !== "failed") || gaveUp || replying;

  // Only the newest send changes; everything above it is history.
  const update = (patch) =>
    setSends((list) => [...list.slice(0, -1), { ...list[list.length - 1], ...patch }]);

  const onSubmit = async (event) => {
    event.preventDefault();
    const email = value.trim();
    if (!valid || locked) {
      setNudge(false);
      requestAnimationFrame(() => setNudge(true));
      return;
    }
    setValue("");
    setAsking(true);
    const next = (sent?.attempt || 0) + 1;
    setSends((list) => [...list, { email, status: "sending", attempt: next }]);
    // Even a fast answer waits out the send, so the swoosh gets to land.
    const [result] = await Promise.allSettled([
      deliver(email),
      wait(reduced ? 0 : MIN_SENDING),
    ]);
    if (result.status === "fulfilled" && !reduced) {
      // A success gets to finish the bar before it says so.
      update({ done: true });
      await wait(320);
    }
    update({ status: result.status === "fulfilled" ? "delivered" : "failed" });
  };

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="chat imsg">
        <h2 className="section__title chat__title" id="contact-title">
          Let’s talk.
        </h2>

        <header className="chat__header">
          <img className="chat__avatar" src="./img/hero.webp" alt="" width="56" height="56" />
          <span className="chat__name">
            <LiquidGlass bezel={10} scale={14} />
            <span className="chat__name-text">Albert</span>
          </span>
        </header>

        <div className="chat__thread" role="log" aria-live="polite">
          {THREAD.map((item, index) =>
            typeof item === "string" ? (
              <p className="chat__stamp" key={index}>
                <strong>{item.split(" ")[0]}</strong> {item.split(" ").slice(1).join(" ")}
              </p>
            ) : (
              <Bubble key={index} tail={item.tail} reaction={item.reaction}>
                {item.text}
              </Bubble>
            )
          )}

          <div ref={askRef} className="chat__ask">
            {asked ? (
              <Bubble tail className="bubble--reply">
                {QUESTION}
              </Bubble>
            ) : (
              asking && <Typing />
            )}
          </div>

          {sends.map((send, index) => {
            const latest = index === sends.length - 1;
            const failuresSoFar = sends
              .slice(0, index + 1)
              .filter((item) => item.status === "failed").length;
            const phase = latest ? reply : "shown";
            return (
              <Fragment key={send.attempt}>
                <div
                  className={`chat__out${send.status === "failed" ? " chat__out--failed" : ""}`}
                >
                  <Bubble sent tail className="bubble--send">
                    {send.email}
                  </Bubble>
                  {send.status === "failed" && (
                    <span className="chat__alert" aria-hidden="true">
                      !
                    </span>
                  )}
                </div>
                {send.status === "sending" ? (
                  <span
                    className={`chat__progress${send.done ? " chat__progress--done" : ""}`}
                    role="progressbar"
                    aria-label="Sending"
                  >
                    <span className="chat__progress-fill" />
                  </span>
                ) : (
                  <p
                    key={send.status}
                    className={`chat__receipt${
                      send.status === "failed" ? " chat__receipt--failed" : ""
                    }`}
                  >
                    {send.status === "delivered" ? "Delivered" : "Not Delivered"}
                  </p>
                )}

                {send.status !== "sending" &&
                  (phase === "shown" ? (
                    <Reply send={send} failures={failuresSoFar} />
                  ) : (
                    phase === "typing" && <Typing />
                  ))}
              </Fragment>
            );
          })}
        </div>

        <form
          className={`composer${nudge ? " composer--nudge" : ""}`}
          name="contact"
          onSubmit={onSubmit}
          onAnimationEnd={() => setNudge(false)}
          noValidate
        >
          <LiquidGlass bezel={16} scale={24} />
          <label className="sr-only" htmlFor="contact-email">
            Your email address
          </label>
          <input
            id="contact-email"
            className="composer__input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="send"
            maxLength={254}
            placeholder={
              gaveUp
                ? "email works better ↑"
                : sent?.status === "delivered"
                ? "Delivered"
                : "your@email.com"
            }
            value={value}
            disabled={!!locked}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            className="composer__send"
            type="submit"
            disabled={!valid || !!locked}
            aria-label="Send"
          >
            <ArrowUp size={17} weight="bold" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
