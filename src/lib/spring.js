/**
 * Spring physics, expressed the way Apple's designers think about it:
 * a damping ratio (how much it overshoots) and a response (how quickly it
 * gets there, in seconds) — not mass/stiffness/damping.
 *
 *   damping 1.0  → critically damped, no bounce. The default for most UI.
 *   damping 0.8  → a little overshoot. Only earn it with a flick or a throw.
 *
 * Springs are used here instead of CSS transitions because they are
 * interruptible: re-targeting mid-flight keeps the current value *and* the
 * current velocity, so a gesture can grab a moving element and reverse it
 * without a visible jump or a velocity "brick wall".
 */

const TWO_PI = Math.PI * 2;

/* ---------------------------------------------------------------- ticker -
 * One rAF loop drives every live spring, so N animating elements cost one
 * callback per frame rather than N.
 */
const live = new Set();
let rafId = 0;
let lastTime = 0;

function tick(now) {
  // Clamp dt so a backgrounded tab doesn't resume with a giant integration step.
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;
  for (const spring of Array.from(live)) spring._step(dt);
  rafId = live.size > 0 ? requestAnimationFrame(tick) : 0;
}

function join(spring) {
  if (live.has(spring)) return;
  live.add(spring);
  if (!rafId) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }
}

function leave(spring) {
  live.delete(spring);
}

/* ---------------------------------------------------------------- spring - */

export class Spring {
  constructor({
    value = 0,
    velocity = 0,
    damping = 1,
    response = 0.4,
    restDelta = 0.01,
    restVelocity = 0.4,
    onUpdate,
    onRest,
  } = {}) {
    this.value = value;
    this.target = value;
    this.velocity = velocity;
    this.damping = damping;
    this.response = response;
    this.restDelta = restDelta;
    this.restVelocity = restVelocity;
    this.onUpdate = onUpdate;
    this.onRest = onRest;
    this.animating = false;
  }

  /**
   * Re-target. Deliberately does NOT reset value or velocity — that is what
   * makes an in-flight animation grabbable and reversible.
   */
  set(target, options = {}) {
    if (options.damping !== undefined) this.damping = options.damping;
    if (options.response !== undefined) this.response = options.response;
    if (options.velocity !== undefined) this.velocity = options.velocity;
    this.target = target;
    if (this._atRest()) {
      this.value = target;
      this._emit();
      this._settle();
      return this;
    }
    this.animating = true;
    join(this);
    return this;
  }

  /** Hard set — no motion, no velocity. Used for resize/layout corrections. */
  jump(value) {
    this.stop();
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this._emit();
    return this;
  }

  /** Freeze at the presentation (on-screen) value, keeping velocity readable. */
  stop() {
    this.animating = false;
    this.target = this.value;
    leave(this);
    return this;
  }

  _atRest() {
    return (
      Math.abs(this.value - this.target) < this.restDelta &&
      Math.abs(this.velocity) < this.restVelocity
    );
  }

  _emit() {
    if (this.onUpdate) this.onUpdate(this.value, this.velocity);
  }

  _settle() {
    this.velocity = 0;
    this.animating = false;
    leave(this);
    if (this.onRest) this.onRest(this.value);
  }

  _step(dt) {
    if (dt <= 0) return;
    const zeta = Math.max(0.05, Math.min(this.damping, 1));
    const w0 = TWO_PI / Math.max(this.response, 0.0001);

    let x = this.value - this.target; // displacement from target
    let v = this.velocity;

    if (zeta < 1) {
      // Underdamped: oscillates on the way in.
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * w0 * dt);
      const c1 = x;
      const c2 = (v + zeta * w0 * x) / wd;
      const cos = Math.cos(wd * dt);
      const sin = Math.sin(wd * dt);
      const nextX = decay * (c1 * cos + c2 * sin);
      v = decay * (wd * (c2 * cos - c1 * sin)) - zeta * w0 * nextX;
      x = nextX;
    } else {
      // Critically damped: fastest settle without overshoot.
      const decay = Math.exp(-w0 * dt);
      const c1 = x;
      const c2 = v + w0 * x;
      const nextX = (c1 + c2 * dt) * decay;
      v = c2 * decay - w0 * nextX;
      x = nextX;
    }

    this.value = this.target + x;
    this.velocity = v;

    if (Math.abs(x) < this.restDelta && Math.abs(v) < this.restVelocity) {
      this.value = this.target;
      this._emit();
      this._settle();
      return;
    }
    this._emit();
  }
}

/* ------------------------------------------------------------- utilities - */

/**
 * Where a flick would come to rest if it decelerated like a scroll view.
 * Apple's own projection from "Designing Fluid Interfaces" — not v²/2a.
 */
export function project(velocity, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Progressive resistance past a boundary. Real things slow before they stop;
 * a hard stop reads as "frozen", this reads as "there's nothing more here".
 */
export function rubberband(overshoot, dimension, constant = 0.55) {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Index of the value in `points` nearest to `value`. */
export function nearestIndex(value, points) {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < points.length; i += 1) {
    const distance = Math.abs(points[i] - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

/**
 * Velocity from a short position history rather than the last two events —
 * a single frame pair is noisy, and the number we hand to the spring at
 * release is the whole seam between dragging and animating.
 */
export function createVelocityTracker(windowMs = 100) {
  let samples = [];
  return {
    reset() {
      samples = [];
    },
    add(position, time = performance.now()) {
      samples.push({ position, time });
      const cutoff = time - windowMs;
      while (samples.length > 2 && samples[0].time < cutoff) samples.shift();
    },
    velocity() {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt <= 0) return 0;
      return (last.position - first.position) / dt; // px per second
    },
  };
}
