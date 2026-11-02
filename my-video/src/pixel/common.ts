import { C, Canvas, H, W } from "./canvas";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t * t * (3 - 2 * t);
/** Movimiento "a saltos" para el look retro. */
export const step = (f: number, n: number) => Math.floor(f / n) * n;

export const hash = (n: number) => {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

export function panel(
  c: Canvas,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  border: number,
) {
  c.rect(x + 1, y, w - 2, h, border);
  c.rect(x, y + 1, w, h - 2, border);
  c.rect(x + 2, y + 1, w - 4, h - 2, fill);
  c.rect(x + 1, y + 2, w - 2, h - 4, fill);
}

/** Texto que se escribe letra a letra, línea por línea. */
export function typeLines(
  c: Canvas,
  lines: string[],
  x: number,
  y: number,
  f: number,
  o: {
    lh?: number;
    color?: number | number[];
    align?: "l" | "c" | "r";
    scale?: number;
    start?: number;
    speed?: number;
    shadow?: number;
  } = {},
) {
  const lh = o.lh ?? 11;
  const speed = o.speed ?? 1.5;
  let t = f - (o.start ?? 0);
  lines.forEach((ln, i) => {
    const n = Array.from(ln.normalize("NFC")).length;
    const reveal = Math.max(0, Math.min(n, Math.floor(t * speed)));
    const col = Array.isArray(o.color)
      ? o.color[i % o.color.length]
      : (o.color ?? C.WHITE);
    c.text(ln, x, y + i * lh, col, {
      reveal,
      align: o.align,
      scale: o.scale,
      shadow: o.shadow,
    });
    t -= n / speed + 4;
  });
}

export function sceneTitle(
  c: Canvas,
  text: string,
  f: number,
  y = 58,
  color: number = C.WHITE,
) {
  const slide = f < 8 ? -(8 - f) * 3 : 0;
  c.text(text, 90, y + slide, color, {
    scale: 2,
    align: "c",
    shadow: C.PURPLE,
  });
}

export function background(c: Canvas, f: number) {
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(hash(i * 2 + 1) * W);
    const y = Math.floor(hash(i * 2 + 2) * H);
    const tw = (Math.floor(f / 14) + i * 5) % 6 === 0;
    c.set(x, y, tw ? C.WHITE : i % 3 === 0 ? C.SLATE : C.DSLATE);
    if (tw) {
      c.set(x - 1, y, C.SLATE);
      c.set(x + 1, y, C.SLATE);
      c.set(x, y - 1, C.SLATE);
      c.set(x, y + 1, C.SLATE);
    }
  }
}

export function transitionCover(c: Canvas, f: number, dur: number, first: boolean, last: boolean) {
  const T = 12;
  let cover = 0;
  if (!first && f < T) cover = 1 - f / T;
  if (!last && f > dur - T) cover = (f - (dur - T)) / T;
  if (cover <= 0) return;
  const B = 10;
  for (let by = 0; by < H / B; by++)
    for (let bx = 0; bx < W / B; bx++)
      if (hash(by * 31 + bx * 7 + 3) < cover) c.rect(bx * B, by * B, B, B, C.NAVY);
}

export function drawHud(c: Canvas, f: number, total: number) {
  const p = clamp01(f / total);
  c.rect(10, 46, 160, 4, C.DSLATE);
  c.rect(11, 47, 158, 2, C.NAVY);
  const w = Math.floor(156 * p);
  c.rect(12, 47, w, 2, C.YELLOW);
  if (w > 0) c.rect(12, 47, w, 1, C.ORANGE);
  c.rect(12 + w, 46, 2, 4, C.WHITE);
}

export function ping(
  c: Canvas,
  cx: number,
  cy: number,
  t: number,
  maxR: number,
  color: number,
  thick = 1,
) {
  c.ring(cx, cy, Math.floor(t * maxR), color, thick);
}

export function sparkle(c: Canvas, cx: number, cy: number, t: number, big = 4) {
  if (t < 0 || t > 1) return;
  const s = Math.floor(Math.sin(Math.PI * t) * big);
  if (s <= 0) return;
  c.rect(cx - s, cy, 2 * s + 1, 1, C.YELLOW);
  c.rect(cx, cy - s, 1, 2 * s + 1, C.YELLOW);
  c.set(cx, cy, C.WHITE);
}

export const HEART = [
  ".xx.xx.",
  "xxxxxxx",
  "xxxxxxx",
  ".xxxxx.",
  "..xxx..",
  "...x...",
];

export function heart(c: Canvas, x: number, y: number, color: number, scale = 1) {
  c.mask(HEART, x, y, color, scale);
}

// ───────────────────────────── Mascota ─────────────────────────────

export type Mood = "happy" | "sick" | "wow";

export function drawMascot(
  c: Canvas,
  cx: number,
  top: number,
  s: number,
  f: number,
  mood: Mood,
  halo = false,
) {
  const w = 12 * s;
  const h = 20 * s;
  const r = w / 2;
  const sick = mood === "sick";
  const fill = sick ? C.RED : C.PINK;
  const outline = C.DRED;

  // piernas
  c.rect(cx - 4 * s, top + h - 1, 3 * s, 3 * s, outline);
  c.rect(cx + s, top + h - 1, 3 * s, 3 * s, outline);

  // brazos
  const wave = Math.floor(f / 5) % 2;
  if (mood === "happy") {
    c.line(cx - 6 * s, top + 12 * s, cx - 9 * s, top + 14 * s, outline, s);
    c.line(cx + 6 * s, top + 12 * s, cx + 9 * s, top + 7 * s + wave * s, outline, s);
  } else if (sick) {
    c.line(cx - 6 * s, top + 12 * s, cx - 8 * s, top + 15 * s, outline, s);
    c.line(cx + 6 * s, top + 12 * s, cx + 8 * s, top + 15 * s, outline, s);
  } else {
    c.line(cx - 6 * s, top + 12 * s, cx - 9 * s, top + 8 * s - wave * s, outline, s);
    c.line(cx + 6 * s, top + 12 * s, cx + 9 * s, top + 8 * s - wave * s, outline, s);
  }

  // cuerpo (cápsula)
  c.shape(
    cx - r - 1,
    top - 1,
    cx + r + 1,
    top + h + 1,
    (x, y) => {
      const px = x + 0.5;
      const py = y + 0.5;
      if (py < top + r) return (px - cx) ** 2 + (py - top - r) ** 2 <= r * r;
      if (py > top + h - r) return (px - cx) ** 2 + (py - (top + h - r)) ** 2 <= r * r;
      return Math.abs(px - cx) <= r;
    },
    fill,
    outline,
  );
  // brillo
  c.rect(cx - 4 * s, top + 3 * s, s, 3 * s, C.WHITE);
  c.rect(cx - 3 * s, top + 2 * s, s, s, C.WHITE);

  // ojos
  const blink = f % 90 > 86;
  const ey = top + 7 * s;
  for (const ex of [cx - 4 * s, cx + 2 * s]) {
    if (sick) {
      c.line(ex, ey, ex + 2 * s - 1, ey + 2 * s - 1, C.NAVY, s);
      c.line(ex + 2 * s - 1, ey, ex, ey + 2 * s - 1, C.NAVY, s);
    } else if (blink) {
      c.rect(ex, ey + s, 2 * s, s, C.NAVY);
    } else {
      c.rect(ex, ey, 2 * s, 3 * s, C.WHITE);
      c.rect(ex + s, ey + s, s, 2 * s, C.NAVY);
    }
  }
  // mejillas
  c.rect(cx - 6 * s, top + 11 * s, 2 * s, s, sick ? C.ORANGE : C.RED);
  c.rect(cx + 4 * s, top + 11 * s, 2 * s, s, sick ? C.ORANGE : C.RED);
  // boca
  const mouth =
    mood === "happy"
      ? ["x...x", ".xxx."]
      : sick
        ? [".xxx.", "x...x"]
        : ["xx", "xx"];
  const mw = mouth[0].length;
  c.mask(mouth, cx - Math.floor((mw * s) / 2), top + 13 * s, C.NAVY, s);

  if (sick) {
    const drop = Math.floor(f / 6) % 4;
    c.rect(cx + 7 * s, top + 3 * s + drop * s, s, 2 * s, C.CYAN);
  }
  if (halo) {
    c.rect(cx - 4 * s, top - 3 * s, 8 * s, s, C.YELLOW);
    c.rect(cx - 5 * s, top - 2 * s, s, s, C.YELLOW);
    c.rect(cx + 4 * s, top - 2 * s, s, s, C.YELLOW);
    c.rect(cx - 4 * s, top - s, 8 * s, s, C.YELLOW);
  }
}

// ───────────────────────────── Anatomía ─────────────────────────────

export const OY = 78;
const A = (pts: number[][]) => pts.map(([x, y]) => [x, y + OY]);

const COLON = A([
  [54, 92],
  [54, 28],
  [126, 28],
  [126, 84],
  [116, 94],
  [100, 98],
]);
const SMALL = A([
  [64, 42],
  [116, 42],
  [116, 50],
  [64, 50],
  [64, 58],
  [116, 58],
  [116, 66],
  [64, 66],
  [64, 74],
  [100, 74],
]);
export const APP_PTS = A([
  [52, 98],
  [49, 105],
  [54, 111],
  [61, 112],
]);
export const APP_BASE = [52, 98 + OY];
export const APP_ANCHOR = [56, 184];
export const NAVEL = [90, 58 + OY];

/** Torso "rayos X" con órganos (sin apéndice). */
export function drawBody(c: Canvas, f: number) {
  c.roundRect(38, OY, 142, OY + 118, 16, C.DSLATE, C.SLATE);
  // línea de escaneo
  const sy = OY + 2 + ((f * 2) % 114);
  for (let x = 42; x < 138; x++) {
    if ((x + sy) % 2 === 0 && c.d[sy * W + x] === C.DSLATE) c.set(x, sy, C.TEAL);
  }
  // hígado y estómago
  c.ellipse(68, OY + 13, 22, 8, C.DRED, C.PURPLE);
  c.ellipse(112, OY + 13, 14, 7, C.GREEN, C.TEAL);

  // intestino grueso (contorno primero, relleno después)
  c.poly(COLON, C.RED, 8);
  c.circle(54, 92 + OY, 8, C.RED);
  c.poly(COLON, C.ORANGE, 6);
  c.circle(54, 92 + OY, 7, C.ORANGE);
  for (let y = 34; y < 90; y += 8) {
    c.rect(51, y + OY, 7, 1, C.RED);
    c.rect(123, y + OY, 7, 1, C.RED);
  }
  for (let x = 62; x < 124; x += 8) c.rect(x, 25 + OY, 1, 7, C.RED);

  // intestino delgado
  c.poly(SMALL, C.PURPLE, 5);
  c.poly(SMALL, C.PINK, 3);

  // ombligo
  c.rect(89, NAVEL[1] - 1, 3, 3, C.CYAN);
  c.set(90, NAVEL[1], C.DSLATE);
}

export function drawAppendix(
  c: Canvas,
  f: number,
  state: "healthy" | "inflamed",
  dx = 0,
  dy = 0,
) {
  const pts = APP_PTS.map(([x, y]) => [x + dx, y + dy]);
  const tip = pts[pts.length - 1];
  if (state === "healthy") {
    c.tube(pts, 3, C.PINK, C.DRED);
  } else {
    const pulse = Math.floor(f / 6) % 2;
    c.tube(pts, 4 + pulse, C.RED, C.DRED);
    c.circle(tip[0], tip[1], 3 + pulse, C.RED, C.DRED);
    c.set(tip[0] - 1, tip[1] - 1, C.YELLOW);
    c.set(pts[1][0], pts[1][1], C.YELLOW);
    c.set(pts[2][0] - 1, pts[2][1], C.ORANGE);
  }
}

// ───────────────────────────── Iconos ─────────────────────────────

export function iconThermometer(c: Canvas, x: number, y: number) {
  c.rect(x + 7, y, 6, 14, C.GRAY);
  c.rect(x + 8, y + 1, 4, 12, C.WHITE);
  c.rect(x + 9, y + 6, 2, 8, C.RED);
  c.circle(x + 10, y + 16, 4, C.RED, C.GRAY);
  c.rect(x + 14, y + 2, 2, 1, C.GRAY);
  c.rect(x + 14, y + 5, 2, 1, C.GRAY);
  c.rect(x + 14, y + 8, 2, 1, C.GRAY);
}

export function iconSick(c: Canvas, x: number, y: number, f: number) {
  c.circle(x + 10, y + 10, 9, C.LIME, C.GREEN);
  c.line(x + 5, y + 6, x + 8, y + 9, C.NAVY, 1);
  c.line(x + 8, y + 6, x + 5, y + 9, C.NAVY, 1);
  c.line(x + 12, y + 6, x + 15, y + 9, C.NAVY, 1);
  c.line(x + 15, y + 6, x + 12, y + 9, C.NAVY, 1);
  const w = Math.floor(f / 6) % 2;
  c.mask(["x.x.x", ".x.x."], x + 5, y + 13 + w, C.NAVY);
}

export function iconNoFood(c: Canvas, x: number, y: number) {
  c.circle(x + 10, y + 10, 9, C.WHITE, C.GRAY);
  c.circle(x + 10, y + 10, 5, C.WHITE, C.GRAY);
  c.line(x + 2, y + 2, x + 18, y + 18, C.RED, 3);
  c.line(x + 18, y + 2, x + 2, y + 18, C.RED, 3);
}

export function iconSteth(c: Canvas, x: number, y: number) {
  c.poly(
    [
      [x + 4, y + 1],
      [x + 4, y + 9],
      [x + 7, y + 13],
      [x + 13, y + 13],
      [x + 16, y + 9],
      [x + 16, y + 1],
    ],
    C.GRAY,
    2,
  );
  c.line(x + 10, y + 13, x + 10, y + 15, C.GRAY, 2);
  c.circle(x + 10, y + 17, 3, C.CYAN, C.GRAY);
  c.rect(x + 3, y, 3, 2, C.WHITE);
  c.rect(x + 14, y, 3, 2, C.WHITE);
}

export function iconDrop(c: Canvas, x: number, y: number) {
  c.shape(
    x + 2,
    y,
    x + 18,
    y + 21,
    (px, py) => {
      const ry = py + 0.5 - y;
      const rx = Math.abs(px + 0.5 - (x + 10));
      if (ry < 10) return ry > 1 && rx <= (ry - 1) * 0.62;
      return rx * rx + (ry - 14) ** 2 <= 36;
    },
    C.RED,
    C.DRED,
  );
  c.rect(x + 7, y + 12, 2, 3, C.WHITE);
}

export function iconMonitor(c: Canvas, x: number, y: number, f: number) {
  c.rect(x + 1, y + 2, 18, 13, C.GRAY);
  c.rect(x + 2, y + 3, 16, 11, C.NAVY);
  const ph = Math.floor(f / 3) % 6;
  const pts: number[][] = [];
  for (let i = 0; i <= 14; i += 2)
    pts.push([x + 3 + i, y + 8 + ((i + ph) % 6 < 3 ? -2 : 2) * (i % 4 === 0 ? 1 : 0)]);
  c.poly(pts, C.CYAN, 1);
  c.rect(x + 8, y + 15, 4, 2, C.GRAY);
  c.rect(x + 5, y + 17, 10, 2, C.SLATE);
}

export function iconBed(c: Canvas, x: number, y: number) {
  c.rect(x, y + 12, 20, 3, C.BLUE);
  c.rect(x, y + 15, 2, 4, C.SLATE);
  c.rect(x + 18, y + 15, 2, 4, C.SLATE);
  c.rect(x + 7, y + 8, 13, 4, C.SKY);
  c.rect(x + 1, y + 9, 6, 3, C.WHITE);
  c.circle(x + 4, y + 7, 3, C.SKIN, C.SKIND);
}

export function iconWalker(c: Canvas, x: number, y: number, f: number, run = false) {
  const k = Math.floor(f / 5) % 2 === 0 ? 1 : -1;
  const lean = run ? 2 : 0;
  c.circle(x + 10 + lean, y + 3, 3, C.SKIN, C.SKIND);
  c.line(x + 10 + lean, y + 6, x + 10, y + 13, C.BLUE, 2);
  const spread = run ? 6 : 3;
  c.line(x + 10, y + 13, x + 10 + k * spread, y + 19, C.DNAVY, 2);
  c.line(x + 10, y + 13, x + 10 - k * spread, y + 19, C.DNAVY, 2);
  c.line(x + 10 + lean, y + 8, x + 10 - k * (run ? 5 : 3) + lean, y + 12, C.SKIND, 1);
  c.line(x + 10 + lean, y + 8, x + 10 + k * (run ? 5 : 3) + lean, y + 12, C.SKIND, 1);
  if (run) {
    c.rect(x, y + 6, 4, 1, C.SLATE);
    c.rect(x + 1, y + 10, 3, 1, C.SLATE);
  }
}
