import React from "react";
import { registerRoot, Composition } from "remotion";
import { PhaseTrailVideo } from "./PhaseTrailVideo";
import { FPS, DURATION_FRAMES } from "./Config";

/**
 * Remotion Root - Register all video compositions here
 * Video showing the 5 phases trail ending with "Blindagem Concluida"
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PhaseTrail"
        component={PhaseTrailVideo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

// Register the root for Remotion CLI
registerRoot(RemotionRoot);

export default RemotionRoot;
