import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Canvas, H, PALETTE, W } from "./pixel/canvas";
import { background, drawHud, transitionCover } from "./pixel/common";
import { SCENES, TOTAL_FRAMES } from "./scenes/scenes";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();

  let start = 0;
  let idx = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (frame < start + SCENES[i].dur || i === SCENES.length - 1) {
      idx = i;
      break;
    }
    start += SCENES[i].dur;
  }
  const scene = SCENES[idx];
  const local = frame - start;

  const c = new Canvas();
  background(c, frame);
  scene.draw(c, local);
  transitionCover(c, local, scene.dur, idx === 0, idx === SCENES.length - 1);
  drawHud(c, frame, TOTAL_FRAMES);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE[1] }}>
      <svg
        width={1080}
        height={1920}
        viewBox={`0 0 ${W} ${H}`}
        shapeRendering="crispEdges"
        style={{ position: "absolute", inset: 0 }}
      >
        {c.rects().map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={PALETTE[r.c]} />
        ))}
      </svg>
      <Audio src={staticFile("chiptune.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
