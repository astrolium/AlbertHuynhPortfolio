import { useCallback, useEffect, useState } from "react";

/* Bumped from "ah-theme": the previous version wrote its default into storage
   on every mount, so any value under the old key records what the page happened
   to do, not what anyone chose. Ignore them and start clean. */
const STORAGE_KEY = "ah-appearance";
/* Light first: it's the default, and the cycle should start where the page does. */
export const THEMES = ["light", "dark", "auto"];

const CHROME = { light: "#fefae0", dark: "#1f2a13" };

function read() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : "light";
  } catch (error) {
    return "light";
  }
}

function prefersDark() {
  return Boolean(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/**
 * The page is light unless the visitor says otherwise — "auto" is a choice they
 * can make, not the state they land in. Nothing is written to storage until
 * they actually pick something, so a default is never mistaken for a preference.
 */
export function useTheme() {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');

    const apply = () => {
      if (theme === "auto") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", theme);
      // The browser chrome can't resolve "auto" from a static meta tag, so
      // resolve it here and keep the address bar with the page.
      if (meta) {
        meta.setAttribute(
          "content",
          CHROME[theme === "auto" ? (prefersDark() ? "dark" : "light") : theme]
        );
      }
    };

    apply();
    if (theme !== "auto" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((current) => {
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        /* private browsing — the preference just doesn't persist */
      }
      return next;
    });
  }, []);

  return { theme, setTheme, cycle };
}
