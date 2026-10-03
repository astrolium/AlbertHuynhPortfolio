import { useEffect, useId, useRef, useState } from "react";

/* Only Chromium resolves an SVG filter inside backdrop-filter. Everywhere else
 * gets a frosted blur, which is still glass, just without the bend. */
const SUPPORTS_REFRACTION =
  typeof navigator !== "undefined" &&
  !!navigator.userAgentData?.brands?.some((b) => /Chromium/.test(b.brand));

/**
 * A displacement map for a rounded rectangle: neutral grey in the middle, and
 * a bezel where each pixel points back along the edge's normal. Fed to
 * feDisplacementMap, it makes whatever is behind the glass bend at the rim,
 * the way light does through a thick lens.
 */
function displacementMap(width, height, radius, bezel) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(width, height);
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);

      // Signed distance to the rounded edge, and the outward normal there.
      let inside;
      let nx = 0;
      let ny = 0;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        inside = r - len;
        nx = (qx / len) * Math.sign(px);
        ny = (qy / len) * Math.sign(py);
      } else if (qx > qy) {
        inside = r - qx;
        nx = Math.sign(px);
      } else {
        inside = r - qy;
        ny = Math.sign(py);
      }

      const t = Math.max(0, Math.min(1, 1 - inside / bezel));
      // A lens profile: flat centre, steep rim. Pointing inward, so the rim
      // magnifies what is under the glass rather than reaching past it.
      const strength = t * t;
      const i = (y * width + x) * 4;
      image.data[i] = 128 - nx * strength * 127;
      image.data[i + 1] = 128 - ny * strength * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

/**
 * Drop inside any positioned element with a border-radius. It fills the
 * parent, refracts what's behind it, and re-measures when the parent resizes.
 */
export default function LiquidGlass({ radius = 999, bezel = 14, scale = 22, blur = 1.5 }) {
  const ref = useRef(null);
  const id = `glass-${useId().replace(/:/g, "")}`;
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!SUPPORTS_REFRACTION || !ref.current) return undefined;
    const el = ref.current;
    let last = "";
    const measure = () => {
      const width = Math.round(el.offsetWidth);
      const height = Math.round(el.offsetHeight);
      const key = `${width}x${height}`;
      if (!width || !height || key === last) return;
      last = key;
      setMap({ width, height, href: displacementMap(width, height, radius, bezel) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [radius, bezel]);

  return (
    <>
      {map && (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <filter
            id={id}
            x="0"
            y="0"
            width={map.width}
            height={map.height}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={map.href}
              x="0"
              y="0"
              width={map.width}
              height={map.height}
              preserveAspectRatio="none"
              result="map"
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="soft" />
            {/* Each channel bends a little differently: a hint of the
                chromatic fringe real glass has at its rim. */}
            <feDisplacementMap in="soft" in2="map" scale={scale * 1.04} xChannelSelector="R" yChannelSelector="G" result="r" />
            <feDisplacementMap in="soft" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="g" />
            <feDisplacementMap in="soft" in2="map" scale={scale * 0.96} xChannelSelector="R" yChannelSelector="G" result="b" />
            <feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rOnly" />
            <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gOnly" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bOnly" />
            <feComposite in="rOnly" in2="gOnly" operator="arithmetic" k2="1" k3="1" result="rg" />
            <feComposite in="rg" in2="bOnly" operator="arithmetic" k2="1" k3="1" />
          </filter>
        </svg>
      )}
      <span
        ref={ref}
        className="glass"
        data-refract={map ? "" : undefined}
        style={map ? { backdropFilter: `url(#${id}) blur(${blur}px) saturate(1.7)` } : undefined}
        aria-hidden="true"
      />
    </>
  );
}
