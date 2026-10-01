/**
 * The logo is a solid black SVG, so it is used as a mask and painted with the
 * text colour — one asset that reads correctly in both appearances.
 *
 * The mask is set here rather than in the stylesheet because the file lives in
 * public/: a url() in App.css would be resolved by the bundler at build time
 * and fail, while this one is resolved by the browser against the page.
 */
const MASK = "url(./img/logo.svg) no-repeat center / contain";

export default function Wordmark({ large = false }) {
  return (
    <span
      className={`wordmark ${large ? "wordmark--large" : ""}`}
      aria-hidden="true"
      style={{ WebkitMask: MASK, mask: MASK }}
    />
  );
}
