import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spring } from "./spring";

/**
 * Reduced motion is not "no feedback" — it's a gentler, non-vestibular
 * equivalent. Everywhere this is true we cross-fade instead of translating.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* Hiding an element for its reveal is synchronous; showing it again needs a
 * frame. Anything that runs script but never paints — a crawler, a link-preview
 * renderer — would therefore be left looking at a blank page. So: prove frames
 * are actually arriving, and if they aren't, give up on revealing and show
 * everything as it is. Content is never contingent on an animation.
 */
let framesArrive = false;
let revealsDisabled = false;
const waitingToBeShown = new Set();

if (typeof window !== "undefined" && window.requestAnimationFrame) {
  window.requestAnimationFrame(() => {
    framesArrive = true;
  });
  window.setTimeout(() => {
    if (framesArrive) return;
    revealsDisabled = true;
    waitingToBeShown.forEach((show) => show());
    waitingToBeShown.clear();
  }, 1000);
}

/**
 * Reveal on scroll, driven by the same critically damped spring as everything
 * else rather than a CSS keyframe — so the settle matches the rest of the page.
 */
export function useReveal({ delay = 0, distance = 18 } = {}) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let spring = null;
    let timer = 0;
    let observer = null;

    const draw = (progress) => {
      el.style.opacity = String(progress);
      el.style.transform = reduced
        ? "none"
        : `translate3d(0, ${((1 - progress) * distance).toFixed(2)}px, 0)`;
    };

    const finish = () => {
      el.style.willChange = "";
      el.style.opacity = "";
      el.style.transform = "";
    };

    const reveal = () => {
      waitingToBeShown.delete(finish);
      spring = new Spring({
        value: 0,
        damping: 1,
        response: 0.55,
        restDelta: 0.003,
        restVelocity: 0.03,
        onUpdate: draw,
        onRest: finish,
      });
      spring.set(1);
    };

    if (revealsDisabled) return undefined; // no frames: leave the content alone

    el.style.willChange = "transform, opacity";
    draw(0);
    waitingToBeShown.add(finish);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          observer = null;
          timer = window.setTimeout(reveal, delay);
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
      );
      observer.observe(el);
    }

    return () => {
      waitingToBeShown.delete(finish);
      if (observer) observer.disconnect();
      if (timer) window.clearTimeout(timer);
      if (spring) spring.stop();
      finish();
    };
  }, [delay, distance, reduced]);

  return ref;
}

/**
 * Spring-driven page scroll. Unlike a fixed-duration tween it can be grabbed:
 * any real input from the user cancels it on the spot instead of fighting them.
 */
let pageScroll = null;

export function springScrollTo(top, { reduced = false } = {}) {
  const max = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const destination = Math.min(Math.max(top, 0), max);

  if (pageScroll) {
    pageScroll.cancel();
    pageScroll = null;
  }

  if (reduced) {
    window.scrollTo(0, destination);
    return;
  }

  const spring = new Spring({
    value: window.scrollY,
    damping: 1,
    response: 0.5,
    restDelta: 0.5,
    restVelocity: 2,
    onUpdate: (value) => window.scrollTo(0, value),
    onRest: () => cancel(),
  });

  const cancel = () => {
    spring.stop();
    events.forEach((name) => window.removeEventListener(name, cancel));
    if (pageScroll && pageScroll.spring === spring) pageScroll = null;
  };

  const events = ["wheel", "touchstart", "pointerdown", "keydown"];
  events.forEach((name) =>
    window.addEventListener(name, cancel, { passive: true })
  );

  pageScroll = { spring, cancel };
  spring.set(destination);
}

export function useScrollTo() {
  const reduced = usePrefersReducedMotion();
  return useCallback(
    (id, offset = 0) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      springScrollTo(top, { reduced });
    },
    [reduced]
  );
}

/**
 * Which section is under the chrome right now. An IntersectionObserver whose
 * root is a one-pixel line just below the nav: whatever crosses that line is
 * the current section, and the browser does the watching, not a scroll handler.
 */
export function useScrollSpy(ids, offset = 96) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const crossing = new Set();
    let atEnd = false;
    let observer = null;

    const settle = () => {
      // The last section can be too short to ever reach the line.
      let current = atEnd ? ids[ids.length - 1] : null;
      if (!current) {
        for (const id of ids) if (crossing.has(id)) current = id;
      }
      if (current) setActive((previous) => (previous === current ? previous : current));
    };

    const observe = () => {
      if (observer) observer.disconnect();
      crossing.clear();
      const below = Math.max(window.innerHeight - offset - 1, 0);
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) crossing.add(entry.target.id);
            else crossing.delete(entry.target.id);
          });
          settle();
        },
        { rootMargin: `-${offset}px 0px -${below}px 0px` }
      );
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    };

    const end = document.createElement("div");
    end.setAttribute("aria-hidden", "true");
    end.style.cssText = "height:2px;margin-top:-2px;pointer-events:none";
    document.body.appendChild(end);
    const endObserver = new IntersectionObserver(([entry]) => {
      atEnd = entry.isIntersecting && window.scrollY > 0;
      settle();
    });
    endObserver.observe(end);

    observe();
    window.addEventListener("resize", observe);
    return () => {
      window.removeEventListener("resize", observe);
      if (observer) observer.disconnect();
      endObserver.disconnect();
      end.remove();
    };
  }, [ids, offset]);

  return active;
}

/** Whether the page has scrolled past a threshold, via a sentinel at the top. */
export function useScrolledPast(threshold = 8) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = `position:absolute;top:0;left:0;width:1px;height:${threshold}px;pointer-events:none`;
    document.body.prepend(sentinel);
    const observer = new IntersectionObserver(([entry]) =>
      setPast(!entry.isIntersecting)
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [threshold]);

  return past;
}

/* Scroll-linked progress for the work figures (`--p`, `--p1`…`--p6`) lives in
 * App.css as a CSS view timeline, not here: the browser drives it directly,
 * with no scroll listener and nothing in the render path. */
