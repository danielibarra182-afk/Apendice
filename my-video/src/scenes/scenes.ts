import { C, Canvas } from "../pixel/canvas";
import {
  APP_ANCHOR,
  APP_BASE,
  NAVEL,
  OY,
  background as _bg,
  clamp01,
  drawAppendix,
  drawBody,
  drawMascot,
  ease,
  heart,
  iconBed,
  iconDrop,
  iconMonitor,
  iconNoFood,
  iconSick,
  iconSteth,
  iconThermometer,
  iconWalker,
  lerp,
  panel,
  ping,
  sceneTitle,
  sparkle,
  step,
  typeLines,
} from "../pixel/common";

void _bg;

export type Scene = { dur: number; draw: (c: Canvas, f: number) => void };

const blink = (f: number, n = 8) => Math.floor(f / n) % 2 === 0;

// Panel de texto inferior (zona segura: termina antes de y=250)
const captionPanel = (c: Canvas) => panel(c, 8, 204, 164, 43, C.DSLATE, C.SLATE);

// ───────────────────────────── 1. Título ─────────────────────────────
function title(c: Canvas, f: number) {
  const reveal = Math.max(0, f - 4);
  c.text("APENDICECTOMÍA", 90, 66, C.WHITE, {
    scale: 2,
    align: "c",
    shadow: C.RED,
    reveal,
    colors: (i) => (i === Math.floor(f / 2) % 24 ? C.YELLOW : C.WHITE),
  });
  typeLines(c, ["UNA DE LAS CIRUGÍAS DE", "URGENCIA MÁS COMUNES"], 90, 96, f, {
    align: "c",
    color: C.GRAY,
    start: 24,
  });

  const bob = [0, 1, 2, 1][Math.floor(f / 6) % 4];
  const sick = f > 50;
  drawMascot(c, 90, 128 + bob, 3, f, sick ? "sick" : "happy");
  if (sick) {
    panel(c, 116, 124, 38, 17, C.WHITE, C.NAVY);
    c.text("¡AY!", 135, 129, C.RED, { align: "c" });
    c.rect(118, 141, 3, 2, C.WHITE);
    c.rect(115, 143, 3, 2, C.WHITE);
  }
  if (f > 62 && blink(f, 10)) {
    c.text("PASO A PASO", 90, 218, C.YELLOW, { scale: 2, align: "c", shadow: C.PURPLE });
  } else if (f > 62) {
    c.text("PASO A PASO", 90, 218, C.ORANGE, { scale: 2, align: "c", shadow: C.PURPLE });
  }
}

// ───────────────────────────── 2. El apéndice ─────────────────────────────
function what(c: Canvas, f: number) {
  sceneTitle(c, "EL APÉNDICE", f);
  drawBody(c, f);
  drawAppendix(c, f, "healthy");
  if (f > 20 && blink(f, 8)) c.ring(55, 182, 11, C.YELLOW, 1);
  if (f > 20) {
    const nudge = Math.floor(f / 8) % 2;
    c.text("< APÉNDICE", 70 + nudge, 184, C.YELLOW, { shadow: C.NAVY });
  }
  captionPanel(c);
  typeLines(
    c,
    ["UN TUBITO DE UNOS 9 CM", "UNIDO AL INTESTINO GRUESO", "SE PUEDE VIVIR SIN ÉL"],
    14,
    211,
    f,
    { color: [C.WHITE, C.WHITE, C.YELLOW], start: 18 },
  );
}

// ───────────────────────────── 3. Apendicitis ─────────────────────────────
function pain(c: Canvas, f: number) {
  sceneTitle(c, "APENDICITIS", f, 58, C.ORANGE);
  drawBody(c, f);
  drawAppendix(c, f, f > 20 ? "inflamed" : "healthy");

  const from = [NAVEL[0], NAVEL[1]];
  const to = [54, 178];
  if (f < 80) {
    const t = (f % 24) / 24;
    ping(c, from[0], from[1], t, 12, C.YELLOW, 1);
    ping(c, from[0], from[1], ((f + 12) % 24) / 24, 12, C.ORANGE, 1);
    c.rect(from[0] - 2, from[1] - 2, 5, 5, C.YELLOW);
    c.rect(from[0] - 1, from[1] - 1, 3, 3, C.RED);
  } else {
    const p = ease(clamp01((f - 80) / 36));
    const q = Math.floor(p * 10) / 10;
    for (let k = 3; k >= 1; k--) {
      const pk = Math.max(0, q - k * 0.07);
      c.rect(
        lerp(from[0], to[0], pk) - 1,
        lerp(from[1], to[1], pk) - 1,
        3,
        3,
        [0, C.RED, C.PURPLE, C.DRED][k],
      );
    }
    const x = lerp(from[0], to[0], q);
    const y = lerp(from[1], to[1], q);
    c.rect(x - 2, y - 2, 5, 5, C.YELLOW);
    c.rect(x - 1, y - 1, 3, 3, C.RED);
    if (p >= 1) {
      ping(c, to[0], to[1] + 4, (f % 20) / 20, 14, C.RED, 1);
      ping(c, to[0], to[1] + 4, ((f + 10) % 20) / 20, 14, C.YELLOW, 1);
      if (blink(f, 6)) c.text("¡AY!", 100, 184, C.RED, { shadow: C.NAVY });
    }
  }

  captionPanel(c);
  if (f < 80)
    typeLines(c, ["1. EL APÉNDICE SE INFLAMA", "Y EL DOLOR EMPIEZA CERCA", "DEL OMBLIGO"], 14, 211, f, {
      color: [C.YELLOW, C.WHITE, C.WHITE],
      start: 4,
    });
  else
    typeLines(c, ["2. EL DOLOR BAJA A LA", "DERECHA (FOSA ILÍACA)", "Y AUMENTA AL MOVERSE"], 14, 211, f, {
      color: [C.ORANGE, C.WHITE, C.WHITE],
      start: 84,
    });
}

// ───────────────────────────── 4. Síntomas ─────────────────────────────
function card(
  c: Canvas,
  f: number,
  at: number,
  y: number,
  lines: [string, string],
  icon: (x: number, y: number) => void,
) {
  const t = clamp01((f - at) / 8);
  if (t <= 0) return;
  const off = Math.floor((1 - t) * 6) * 24;
  const x = 8 + off;
  panel(c, x, y, 164, 30, C.DSLATE, C.SLATE);
  icon(x + 6, y + 5);
  const reveal = Math.floor((f - at) * 1.5);
  c.text(lines[0], x + 34, y + 6, C.YELLOW, { reveal });
  c.text(lines[1], x + 34, y + 18, C.GRAY, { reveal: reveal - 18 });
}

function symptoms(c: Canvas, f: number) {
  sceneTitle(c, "SÍNTOMAS", f);
  card(c, f, 8, 80, ["FIEBRE LEVE", "UNOS 37.5-38.5 °C"], (x, y) => iconThermometer(c, x, y));
  card(c, f, 30, 114, ["NÁUSEAS Y VÓMITO", "DESPUÉS DEL DOLOR"], (x, y) => iconSick(c, x, y, f));
  card(c, f, 52, 148, ["SIN APETITO", "MUY COMÚN (ANOREXIA)"], (x, y) => iconNoFood(c, x, y));

  if (f > 80) {
    const flash = blink(f, 6);
    panel(c, 8, 192, 164, 55, C.NAVY, flash ? C.RED : C.ORANGE);
    c.text("¡NO ESPERES!", 90, 202, C.YELLOW, { scale: 2, align: "c", shadow: C.RED });
    typeLines(c, ["PUEDE PERFORARSE", "VE A URGENCIAS"], 90, 226, f, {
      align: "c",
      color: [C.WHITE, C.GRAY],
      start: 86,
    });
  }
}

// ───────────────────────────── 5. Diagnóstico ─────────────────────────────
function diagnosis(c: Canvas, f: number) {
  sceneTitle(c, "DIAGNÓSTICO", f);
  card(c, f, 8, 80, ["EXAMEN FÍSICO", "PRESIÓN EN EL ABDOMEN"], (x, y) => iconSteth(c, x, y));
  card(c, f, 30, 114, ["ANÁLISIS DE SANGRE", "LEUCOCITOS ELEVADOS"], (x, y) => iconDrop(c, x, y));
  card(c, f, 52, 148, ["ECOGRAFÍA O TAC", "VEN EL APÉNDICE"], (x, y) => iconMonitor(c, x, y, f));

  if (f > 84) {
    captionPanel(c);
    typeLines(c, ["EL MÉDICO DECIDE", "SI HAY QUE OPERAR"], 90, 214, f, {
      align: "c",
      lh: 13,
      color: [C.YELLOW, C.WHITE],
      start: 86,
    });
    if (f > 120) {
      c.rect(84, 236, 3, 3, C.LIME);
      c.rect(87, 238, 3, 3, C.LIME);
      c.rect(90, 233, 3, 3, C.LIME);
      c.rect(93, 230, 3, 3, C.LIME);
    }
  }
}

// ───────────────────────────── 6. Cirugía ─────────────────────────────
const PORTS = [
  [NAVEL[0], NAVEL[1]],
  [90, 104 + OY],
  [118, 92 + OY],
];
const STEPS: string[][] = [
  ["PASO 1: ANESTESIA", "DORMIDO Y SIN DOLOR", "DURA 30-60 MIN APROX."],
  ["PASO 2: 3 INCISIONES", "DE UNOS 1 CM CADA UNA", "(LAPAROSCOPIA)"],
  ["PASO 3: ENTRA LA CÁMARA", "Y LOS INSTRUMENTOS", "SE VE TODO EN PANTALLA"],
  ["PASO 4: SE CORTA EL", "APÉNDICE Y SE CIERRA", "SU BASE"],
  ["PASO 5: SE SACA EN UNA", "BOLSA POR UNA INCISIÓN", "Y SE CIERRAN LOS CORTES"],
];

function tool(c: Canvas, from: number[], to: number[], p: number) {
  if (p <= 0) return;
  const ex = lerp(from[0], to[0], p);
  const ey = lerp(from[1], to[1], p);
  c.line(from[0], from[1], ex, ey, C.GRAY, 1);
  c.rect(ex - 1, ey - 1, 2, 2, C.WHITE);
  c.rect(from[0] - 2, from[1] - 2, 5, 5, C.WHITE);
  c.rect(from[0] - 1, from[1] - 1, 3, 3, C.SLATE);
}

function surgery(c: Canvas, f: number) {
  const done = f >= 285;
  sceneTitle(c, done ? "¡LISTO!" : "LA CIRUGÍA", f, 58, done ? C.LIME : C.WHITE);
  drawBody(c, f);

  const detached = f >= 198;
  let ax = APP_ANCHOR[0];
  let ay = APP_ANCHOR[1];
  if (f >= 198) ay = APP_ANCHOR[1] - Math.min(7, Math.floor((f - 198) / 4));
  if (f >= 245) {
    const p = ease(clamp01((f - 245) / 30));
    ax = lerp(APP_ANCHOR[0], 90, p);
    ay = lerp(APP_ANCHOR[1] - 7, NAVEL[1] + 4, p);
  }
  if (f >= 275) {
    const p = clamp01((f - 275) / 20);
    ax = 90;
    ay = lerp(NAVEL[1] + 4, 66, p);
  }
  ay = Math.round(ay);
  ax = Math.round(ax);

  if (!detached) drawAppendix(c, f, "inflamed");
  else if (f < 296) drawAppendix(c, f, "inflamed", ax - APP_ANCHOR[0], ay - APP_ANCHOR[1]);

  // grapa en el muñón
  if (detached) {
    c.rect(50, APP_BASE[1] - 1, 4, 1, C.CYAN);
    c.rect(50, APP_BASE[1] + 1, 4, 1, C.CYAN);
  }

  // Paso 1: dormido
  if (f < 62) {
    for (let k = 0; k < 3; k++) {
      const ph = (f / 2 + k * 14) % 42;
      const y = 160 - ph;
      if (y < 82) continue;
      c.text("Z", 122 + k * 4 + (Math.floor(ph / 6) % 2), Math.round(y), k === 1 ? C.SKY : C.WHITE, {
        scale: k === 2 ? 2 : 1,
      });
    }
  }

  // Paso 2: puertos
  PORTS.forEach(([px, py], i) => {
    const at = 68 + i * 16;
    if (f < at) return;
    const closed = f >= 286;
    c.circle(px, py, 3, C.NAVY, closed ? C.LIME : C.WHITE);
    if (closed) {
      c.set(px - 1, py - 1, C.LIME);
      c.set(px + 1, py + 1, C.LIME);
      c.set(px + 1, py - 1, C.LIME);
      c.set(px - 1, py + 1, C.LIME);
    }
    if (f < at + 10) ping(c, px, py, (f - at) / 10, 9, C.YELLOW, 1);
  });

  // Paso 3: cámara y herramientas
  if (f >= 120 && f < 278) {
    const lightP = clamp01((f - 118) / 12);
    const origin = PORTS[0];
    const tgt = [ax + 2, ay];
    const ang = Math.atan2(tgt[1] - origin[1], tgt[0] - origin[0]);
    const phase = Math.floor(f / 4) % 2;
    for (let y = 80; y < 196; y++)
      for (let x = 40; x < 140; x++) {
        const dx = x - origin[0];
        const dy = y - origin[1];
        const d = Math.hypot(dx, dy);
        const reach = Math.hypot(tgt[0] - origin[0], tgt[1] - origin[1]) + 6;
        if (d < 4 || d > reach * lightP) continue;
        let da = Math.atan2(dy, dx) - ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < 0.2 && (x + y + phase) % 3 === 0) c.set(x, y, C.CYAN);
      }
  }
  if (f >= 125) {
    let p = ease(clamp01((f - 125) / 30));
    if (f >= 278) p = 1 - clamp01((f - 278) / 12);
    const tgt = [ax, ay];
    tool(c, PORTS[2], tgt, p);
    tool(c, PORTS[1], [ax + 3, ay + 2], p);
  }

  // corte
  if (f >= 190 && f < 202) {
    const t = (f - 190) / 12;
    sparkle(c, APP_BASE[0], APP_BASE[1], t, 6);
    if (blink(f, 2)) c.text("CLIC", 74, 168, C.WHITE, { shadow: C.RED });
  }
  if (f >= 296 && f < 312) sparkle(c, 90, 66, (f - 296) / 16, 7);
  if (done) {
    sparkle(c, 56 + (step(f, 6) % 24), 100 + (step(f, 4) % 30), (f % 12) / 12, 3);
    sparkle(c, 120 - (step(f, 5) % 20), 150 - (step(f, 3) % 20), ((f + 5) % 12) / 12, 3);
  }

  // texto del paso
  captionPanel(c);
  const si = Math.min(4, Math.floor(f / 60));
  typeLines(c, STEPS[si], 14, 211, f - si * 60, {
    color: [C.YELLOW, C.WHITE, C.GRAY],
    start: 2,
    speed: 1.6,
  });
}

// ───────────────────────────── 7. Recuperación ─────────────────────────────
function recovery(c: Canvas, f: number) {
  sceneTitle(c, "RECUPERACIÓN", f);
  card(c, f, 8, 80, ["DÍAS 1-2", "ALTA DEL HOSPITAL"], (x, y) => iconBed(c, x, y));
  card(c, f, 36, 114, ["SEMANA 1-2", "ACTIVIDAD LIGERA"], (x, y) => iconWalker(c, x, y, f));
  card(c, f, 64, 148, ["SEMANAS 2-4", "DEPORTE Y ESFUERZO"], (x, y) => iconWalker(c, x, y, f, true));

  // barra de energía
  c.text("ENERGÍA", 10, 187, C.WHITE);
  panel(c, 56, 183, 114, 12, C.NAVY, C.SLATE);
  const p = clamp01((f - 8) / 110);
  const segs = Math.floor((0.12 + 0.88 * p) * 26);
  for (let i = 0; i < segs; i++) {
    const col = i < 6 ? C.RED : i < 12 ? C.ORANGE : i < 18 ? C.YELLOW : C.LIME;
    c.rect(59 + i * 4, 186, 3, 6, col);
  }
  if (p >= 1) heart(c, 160, 197 - (Math.floor(f / 6) % 2), C.RED);

  captionPanel(c);
  typeLines(c, ["CADA CASO ES DISTINTO", "SIGUE LAS INDICACIONES", "DE TU CIRUJANO"], 14, 211, f, {
    color: [C.YELLOW, C.WHITE, C.WHITE],
    start: 96,
  });
}

// ───────────────────────────── 8. Cierre ─────────────────────────────
function outro(c: Canvas, f: number) {
  const slide = f < 8 ? -(8 - f) * 3 : 0;
  const col = blink(f, 12) ? C.YELLOW : C.ORANGE;
  c.text("¡NO IGNORES", 90, 58 + slide, col, { scale: 2, align: "c", shadow: C.RED });
  c.text("EL DOLOR!", 90, 78 + slide, col, { scale: 2, align: "c", shadow: C.RED });
  typeLines(c, ["DOLOR ABDOMINAL QUE", "EMPEORA: VE A URGENCIAS"], 90, 106, f, {
    align: "c",
    color: C.WHITE,
    start: 14,
  });

  const bob = [0, 1, 2, 1][Math.floor(f / 8) % 4];
  drawMascot(c, 90, 138 + bob * 2, 2, f, "happy", true);
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 18) % 54) / 54;
    heart(c, [44, 128, 138][i], Math.round(176 - t * 40), [C.RED, C.PINK, C.RED][i]);
  }

  captionPanel(c);
  typeLines(c, ["INFO EDUCATIVA: NO", "SUSTITUYE A TU MÉDICO", "GUARDA Y COMPARTE"], 14, 211, f, {
    color: [C.GRAY, C.GRAY, C.YELLOW],
    start: 40,
  });
}

export const SCENES: Scene[] = [
  { dur: 120, draw: title },
  { dur: 150, draw: what },
  { dur: 180, draw: pain },
  { dur: 150, draw: symptoms },
  { dur: 150, draw: diagnosis },
  { dur: 300, draw: surgery },
  { dur: 180, draw: recovery },
  { dur: 150, draw: outro },
];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);
