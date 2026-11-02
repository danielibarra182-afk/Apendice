import { ACCENTS, GLYPHS } from "./font";

// Resolución lógica: 180x320 → escalada x6 = 1080x1920
export const W = 180;
export const H = 320;

export const PALETTE = [
  "transparent",
  "#1a1c2c", // 1 NAVY
  "#5d275d", // 2 PURPLE
  "#b13e53", // 3 RED
  "#ef7d57", // 4 ORANGE
  "#ffcd75", // 5 YELLOW
  "#a7f070", // 6 LIME
  "#38b764", // 7 GREEN
  "#257179", // 8 TEAL
  "#29366f", // 9 DNAVY
  "#3b5dc9", // 10 BLUE
  "#41a6f6", // 11 SKY
  "#73eff7", // 12 CYAN
  "#f4f4f4", // 13 WHITE
  "#94b0c2", // 14 GRAY
  "#566c86", // 15 SLATE
  "#333c57", // 16 DSLATE
  "#f2b48c", // 17 SKIN
  "#d98e6b", // 18 SKIND
  "#ff8fa3", // 19 PINK
  "#7a1f3d", // 20 DRED
];

export const C = {
  NAVY: 1,
  PURPLE: 2,
  RED: 3,
  ORANGE: 4,
  YELLOW: 5,
  LIME: 6,
  GREEN: 7,
  TEAL: 8,
  DNAVY: 9,
  BLUE: 10,
  SKY: 11,
  CYAN: 12,
  WHITE: 13,
  GRAY: 14,
  SLATE: 15,
  DSLATE: 16,
  SKIN: 17,
  SKIND: 18,
  PINK: 19,
  DRED: 20,
} as const;

export type Rect = { x: number; y: number; w: number; h: number; c: number };

export type TextOpts = {
  scale?: number;
  align?: "l" | "c" | "r";
  shadow?: number;
  reveal?: number;
  colors?: (i: number) => number;
};

type Inside = (x: number, y: number) => boolean;

export class Canvas {
  d = new Uint8Array(W * H);

  set(x: number, y: number, c: number) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    this.d[y * W + x] = c;
  }

  rect(x: number, y: number, w: number, h: number, c: number) {
    x = Math.round(x);
    y = Math.round(y);
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
  }

  /** Forma rellena con contorno de 1px calculado automáticamente. */
  shape(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    inside: Inside,
    fill: number,
    outline?: number,
  ) {
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    x1 = Math.ceil(x1);
    y1 = Math.ceil(y1);
    const w = x1 - x0;
    const h = y1 - y0;
    const m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) m[y * w + x] = inside(x + x0, y + y0) ? 1 : 0;
    const at = (x: number, y: number) =>
      x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        const edge =
          !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
        this.set(x + x0, y + y0, edge && outline !== undefined ? outline : fill);
      }
  }

  circle(cx: number, cy: number, r: number, fill: number, outline?: number) {
    this.shape(
      cx - r - 1,
      cy - r - 1,
      cx + r + 2,
      cy + r + 2,
      (x, y) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r,
      fill,
      outline,
    );
  }

  ellipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    fill: number,
    outline?: number,
  ) {
    this.shape(
      cx - rx - 1,
      cy - ry - 1,
      cx + rx + 2,
      cy + ry + 2,
      (x, y) =>
        ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1,
      fill,
      outline,
    );
  }

  roundRect(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r: number,
    fill: number,
    outline?: number,
  ) {
    this.shape(
      x0,
      y0,
      x1,
      y1,
      (x, y) => {
        if (x < x0 || y < y0 || x >= x1 || y >= y1) return false;
        const px = x + 0.5;
        const py = y + 0.5;
        const cx = Math.min(Math.max(px, x0 + r), x1 - r);
        const cy = Math.min(Math.max(py, y0 + r), y1 - r);
        return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
      },
      fill,
      outline,
    );
  }

  line(x0: number, y0: number, x1: number, y1: number, c: number, t = 1) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const off = Math.floor(t / 2);
    for (;;) {
      this.rect(x0 - off, y0 - off, t, t, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  poly(pts: number[][], c: number, t = 1) {
    for (let i = 0; i < pts.length - 1; i++)
      this.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c, t);
  }

  /** Tubo con contorno: primero contorno, luego relleno. */
  tube(pts: number[][], t: number, fill: number, outline: number) {
    this.poly(pts, outline, t + 2);
    this.poly(pts, fill, t);
  }

  ring(cx: number, cy: number, r: number, c: number, thick = 1) {
    const R = Math.ceil(r + thick + 1);
    for (let y = -R; y <= R; y++)
      for (let x = -R; x <= R; x++) {
        const d = Math.sqrt(x * x + y * y);
        if (Math.abs(d - r) < thick * 0.6) this.set(cx + x, cy + y, c);
      }
  }

  /** Sprite ASCII. '.' = transparente. colors: color único o mapa char→color. */
  mask(
    rows: string[],
    x: number,
    y: number,
    colors: number | Record<string, number>,
    scale = 1,
  ) {
    rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[rx];
        if (ch === "." || ch === " ") continue;
        const col = typeof colors === "number" ? colors : colors[ch];
        if (col === undefined) continue;
        this.rect(x + rx * scale, y + ry * scale, scale, scale, col);
      }
    });
  }

  static textWidth(s: string, scale = 1) {
    const n = Array.from(s.normalize("NFC")).length;
    return n * 6 * scale - scale;
  }

  text(s: string, x: number, y: number, color: number, o: TextOpts = {}) {
    const sc = o.scale ?? 1;
    const chars = Array.from(s.toUpperCase().normalize("NFC"));
    const width = chars.length * 6 * sc - sc;
    let sx = x;
    if (o.align === "c") sx = x - Math.floor(width / 2);
    if (o.align === "r") sx = x - width;
    const n = Math.min(chars.length, o.reveal ?? chars.length);

    const draw = (ox: number, oy: number, col: number | null) => {
      for (let i = 0; i < n; i++) {
        const decomposed = chars[i].normalize("NFD");
        const base = decomposed[0];
        const mark = decomposed[1];
        const g = GLYPHS[base] ?? GLYPHS["?"];
        const cc = col ?? (o.colors ? o.colors(i) : color);
        const gx = sx + ox + i * 6 * sc;
        const gy = y + oy;
        for (let r = 0; r < 7; r++)
          for (let q = 0; q < 5; q++)
            if (g[r][q] === "1") this.rect(gx + q * sc, gy + r * sc, sc, sc, cc);
        if (mark && ACCENTS[mark])
          for (const [ax, ay] of ACCENTS[mark])
            this.rect(gx + ax * sc, gy + ay * sc, sc, sc, cc);
      }
    };
    if (o.shadow !== undefined) draw(sc, sc, o.shadow);
    draw(0, 0, null);
  }

  /** Compresión horizontal por colores para minimizar elementos SVG. */
  rects(): Rect[] {
    const out: Rect[] = [];
    for (let y = 0; y < H; y++) {
      let x = 0;
      while (x < W) {
        const c = this.d[y * W + x];
        if (!c) {
          x++;
          continue;
        }
        let x2 = x + 1;
        while (x2 < W && this.d[y * W + x2] === c) x2++;
        out.push({ x, y, w: x2 - x, h: 1, c });
        x = x2;
      }
    }
    // Fusión vertical de rectángulos idénticos consecutivos
    const merged: Rect[] = [];
    const open = new Map<string, Rect>();
    let prevKeys = new Set<string>();
    let row = -1;
    let curKeys = new Set<string>();
    for (const r of out) {
      if (r.y !== row) {
        prevKeys = curKeys;
        curKeys = new Set();
        row = r.y;
      }
      const key = `${r.x},${r.w},${r.c}`;
      const prev = open.get(key);
      if (prev && prevKeys.has(key) && prev.y + prev.h === r.y) {
        prev.h += 1;
      } else {
        const nr = { ...r };
        merged.push(nr);
        open.set(key, nr);
      }
      curKeys.add(key);
    }
    return merged;
  }
}
