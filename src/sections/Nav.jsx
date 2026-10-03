import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  usePrefersReducedMotion,
  useScrolledPast,
  useScrollSpy,
  useScrollTo,
} from "../lib/motion";
import { CircleHalf, Moon, Sun } from "@phosphor-icons/react";
import { Spring } from "../lib/spring";
import { useTheme } from "../lib/theme";
import Wordmark from "../components/Wordmark";
import LiquidGlass from "../components/LiquidGlass";

/* Names for what's in them, not vague umbrellas: "Work", not "Home". */
const LINKS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const SPY_IDS = ["top", ...LINKS.map((link) => link.id)];
const NAV_OFFSET = 84;

const THEME_LABEL = {
  auto: "Appearance: follows your device",
  light: "Appearance: light",
  dark: "Appearance: dark",
};

const THEME_ICON = { light: Sun, dark: Moon, auto: CircleHalf };

function ThemeIcon({ theme }) {
  const Icon = THEME_ICON[theme];
  return <Icon size={18} weight="regular" aria-hidden="true" />;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const active = useScrollSpy(SPY_IDS, NAV_OFFSET + 24);
  const floating = useScrolledPast(12);
  const reduced = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const { theme, cycle } = useTheme();

  const listRef = useRef(null);
  const indicatorRef = useRef(null);
  const sheetRef = useRef(null);
  const toggleRef = useRef(null);
  const indicator = useRef(null);
  const sheet = useRef(null);

  /* --- the active pill. X and width get their own springs: a single spring
     on a 2D distance desyncs the moment the two axes disagree. --- */
  useLayoutEffect(() => {
    const draw = () => {
      const el = indicatorRef.current;
      if (!el || !indicator.current) return;
      const { x, width } = indicator.current;
      el.style.transform = `translate3d(${x.value.toFixed(2)}px, 0, 0)`;
      el.style.width = `${Math.max(width.value, 0).toFixed(2)}px`;
    };
    const options = {
      damping: 1,
      response: 0.35,
      restDelta: 0.1,
      restVelocity: 1,
      onUpdate: draw,
    };
    indicator.current = {
      x: new Spring(options),
      width: new Spring(options),
      placed: false,
    };
    const springs = indicator.current;
    return () => {
      springs.x.stop();
      springs.width.stop();
      indicator.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    const el = indicatorRef.current;
    if (!list || !el || !indicator.current) return undefined;

    const place = () => {
      const item = list.querySelector('[data-active="true"]');
      const springs = indicator.current;
      if (!springs) return;
      if (!item) {
        el.style.opacity = "0";
        return;
      }
      const bounds = list.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      const x = box.left - bounds.left;
      el.style.opacity = "1";
      if (!springs.placed || reduced) {
        springs.placed = true;
        springs.x.jump(x);
        springs.width.jump(box.width);
        return;
      }
      springs.x.set(x);
      springs.width.set(box.width);
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, reduced]);

  /* --- the mobile sheet materialises: blur, scale and opacity move together,
     anchored to the button that opened it, so it arrives *from* the toggle. --- */
  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return undefined;
    const spring = new Spring({
      value: 0,
      damping: 0.8,
      response: 0.3,
      restDelta: 0.003,
      restVelocity: 0.03,
      onUpdate: (value) => {
        el.style.setProperty("--material", value.toFixed(3));
        el.style.visibility = value < 0.002 ? "hidden" : "visible";
      },
    });
    sheet.current = spring;
    spring.jump(0);
    return () => {
      spring.stop();
      sheet.current = null;
    };
  }, []);

  useEffect(() => {
    const spring = sheet.current;
    if (!spring) return;
    if (reduced) spring.jump(open ? 1 : 0);
    else spring.set(open ? 1 : 0);
  }, [open, reduced]);

  /* Never trap anyone inside the menu. */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        if (toggleRef.current) toggleRef.current.focus();
      }
    };
    const onPointerDown = (event) => {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 860) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const go = useCallback(
    (event, id) => {
      event.preventDefault();
      setOpen(false);
      scrollTo(id, NAV_OFFSET);
    },
    [scrollTo]
  );

  return (
    <header className={`nav ${floating ? "is-floating" : ""}`}>
      <div className="nav__bar">
        <a
          className="nav__wordmark"
          href="#top"
          aria-label="Albert Huynh, back to top"
          onClick={(event) => go(event, "top")}
        >
          <Wordmark />
        </a>

        <nav className="nav__links" aria-label="Sections">
          {/* The same liquid glass as the chat composer at the bottom. */}
          <LiquidGlass bezel={12} scale={18} />
          <ul ref={listRef}>
            <li className="nav__indicator-slot" aria-hidden="true">
              <span className="nav__indicator" ref={indicatorRef} />
            </li>
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="nav__link"
                  data-active={active === link.id ? "true" : "false"}
                  aria-current={active === link.id ? "true" : undefined}
                  onClick={(event) => go(event, link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="icon-button icon-button--glass"
            onClick={cycle}
            aria-label={THEME_LABEL[theme]}
            title={THEME_LABEL[theme]}
          >
            <ThemeIcon theme={theme} />
          </button>

          <button
            type="button"
            ref={toggleRef}
            className={`icon-button icon-button--glass nav__toggle ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls="nav-sheet"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav__toggle-line" />
            <span className="nav__toggle-line" />
          </button>
        </div>
      </div>

      <div
        className="nav__sheet"
        id="nav-sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="false"
        aria-label="Menu"
      >
        <ul>
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="nav__sheet-link"
                tabIndex={open ? 0 : -1}
                onClick={(event) => go(event, link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
