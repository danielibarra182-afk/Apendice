import { Composition } from "remotion";
import { Reel } from "./Reel";
import { TOTAL_FRAMES } from "./scenes/scenes";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Apendicectomia"
      component={Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
