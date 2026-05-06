import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { MovementPattern } from "@/store/types";

interface ExerciseDemoProps {
  pattern?: MovementPattern;
  color?: string;
}

const DURATION = 1400;

function useLoop(duration = DURATION) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration]);
  return anim;
}

// ------------------------------------------------------------------
// SCENE: Horizontal Push (Bench Press / Push-up / Chest)
// Bar moves toward/away, plates scale with "load"
// ------------------------------------------------------------------
function SceneHorizontalPush({ accent }: { accent: string }) {
  const anim = useLoop(1600);
  const barY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 38] });
  const plateScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <View style={s.scene}>
      {/* Bench */}
      <View style={[s.bench, { backgroundColor: "#2a2a2a" }]} />
      {/* Body on bench */}
      <View style={[s.benchBody, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.benchHead, { backgroundColor: "#e2c4a3" }]} />
      {/* Animated bar */}
      <Animated.View style={[s.barbellRow, { transform: [{ translateY: barY }] }]}>
        <Animated.View style={[s.plateLeft, { backgroundColor: accent, transform: [{ scale: plateScale }] }]} />
        <View style={[s.barShaft, { backgroundColor: "#888" }]} />
        <Animated.View style={[s.plateRight, { backgroundColor: accent, transform: [{ scale: plateScale }] }]} />
      </Animated.View>
      {/* Arms reaching up */}
      <Animated.View style={[s.armLeft, { backgroundColor: "#e2c4a3", transform: [{ translateY: barY }] }]} />
      <Animated.View style={[s.armRight, { backgroundColor: "#e2c4a3", transform: [{ translateY: barY }] }]} />
      {/* Glow ring */}
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Vertical Push (Overhead Press)
// Bar goes straight up
// ------------------------------------------------------------------
function SceneVerticalPush({ accent }: { accent: string }) {
  const anim = useLoop(1500);
  const barY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -52] });
  const glow = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.2] });

  return (
    <View style={s.scene}>
      {/* Standing figure */}
      <View style={[s.standHead, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standTorso, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegR, { backgroundColor: "#e2c4a3" }]} />
      {/* Barbell overhead */}
      <Animated.View style={[s.ohBarbell, { transform: [{ translateY: barY }] }]}>
        <View style={[s.plateLeft, { backgroundColor: accent }]} />
        <View style={[s.barShaft, { backgroundColor: "#888" }]} />
        <View style={[s.plateRight, { backgroundColor: accent }]} />
      </Animated.View>
      {/* Arms */}
      <Animated.View style={[s.ohArmL, { backgroundColor: "#e2c4a3", transform: [{ translateY: barY }] }]} />
      <Animated.View style={[s.ohArmR, { backgroundColor: "#e2c4a3", transform: [{ translateY: barY }] }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Vertical Pull (Pull-up / Lat Pulldown)
// Body moves up toward fixed bar
// ------------------------------------------------------------------
function SceneVerticalPull({ accent }: { accent: string }) {
  const anim = useLoop(1600);
  const bodyY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -42] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] });

  return (
    <View style={s.scene}>
      {/* Fixed pull-up bar */}
      <View style={[s.pullBar, { backgroundColor: "#888" }]} />
      {/* Body rising */}
      <Animated.View style={{ transform: [{ translateY: bodyY }] }}>
        <View style={[s.pullHead, { backgroundColor: "#e2c4a3" }]} />
        <View style={[s.pullTorso, { backgroundColor: "#e2c4a3" }]} />
        <View style={[s.pullLegL, { backgroundColor: "#e2c4a3" }]} />
        <View style={[s.pullLegR, { backgroundColor: "#e2c4a3" }]} />
      </Animated.View>
      {/* Arms to bar */}
      <Animated.View style={[s.pullArmL, { backgroundColor: accent, transform: [{ translateY: bodyY }] }]} />
      <Animated.View style={[s.pullArmR, { backgroundColor: accent, transform: [{ translateY: bodyY }] }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Horizontal Pull (Row)
// Bar/handle moves toward torso
// ------------------------------------------------------------------
function SceneHorizontalPull({ accent }: { accent: string }) {
  const anim = useLoop(1500);
  const handleX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 38] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] });

  return (
    <View style={s.scene}>
      {/* Bent-over torso */}
      <View style={[s.rowTorso, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.rowHead, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.rowLegL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.rowLegR, { backgroundColor: "#e2c4a3" }]} />
      {/* Moving handle + arm */}
      <Animated.View style={[s.rowHandle, { backgroundColor: accent, transform: [{ translateX: handleX }] }]} />
      <Animated.View style={[s.rowArm, { backgroundColor: "#e2c4a3", transform: [{ translateX: handleX }] }]} />
      {/* Cable line */}
      <View style={[s.cableH, { backgroundColor: "#555" }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Squat
// Figure squats down — body box shrinks/descends
// ------------------------------------------------------------------
function SceneSquat({ accent }: { accent: string }) {
  const anim = useLoop(1700);
  // Body descends and height compresses
  const bodyY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 28] });
  const bodyH = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const kneeW = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] });

  return (
    <View style={s.scene}>
      {/* Head */}
      <Animated.View style={[s.sqHead, { backgroundColor: "#e2c4a3", transform: [{ translateY: bodyY }] }]} />
      {/* Bar on shoulders */}
      <Animated.View style={[s.sqBarbell, { transform: [{ translateY: bodyY }] }]}>
        <View style={[s.plateLeft, { backgroundColor: accent }]} />
        <View style={[s.barShaft, { backgroundColor: "#888" }]} />
        <View style={[s.plateRight, { backgroundColor: accent }]} />
      </Animated.View>
      {/* Torso */}
      <Animated.View
        style={[s.sqTorso, {
          backgroundColor: "#e2c4a3",
          transform: [{ translateY: bodyY }, { scaleY: bodyH }],
        }]}
      />
      {/* Knees spreading */}
      <Animated.View style={[s.sqLegL, { backgroundColor: "#e2c4a3", transform: [{ translateY: bodyY }, { scaleX: kneeW }] }]} />
      <Animated.View style={[s.sqLegR, { backgroundColor: "#e2c4a3", transform: [{ translateY: bodyY }, { scaleX: kneeW }] }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Hinge (Deadlift / RDL)
// Torso rotates forward from hips — using translate-rotate-translate
// ------------------------------------------------------------------
function SceneHinge({ accent }: { accent: string }) {
  const anim = useLoop(1800);
  // Pivot trick: rotate around a point 60px below center of element
  const PIVOT = 55;
  const deg = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "72deg"] });
  const barY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 48] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] });

  return (
    <View style={s.scene}>
      {/* Fixed legs */}
      <View style={[s.hingeLegL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.hingeLegR, { backgroundColor: "#e2c4a3" }]} />
      {/* Torso pivots at hip — pivot trick: move down by PIVOT, rotate, move up by PIVOT */}
      <Animated.View
        style={[s.hingeTorso, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: PIVOT },
            { rotate: deg },
            { translateY: -PIVOT },
          ],
        }]}
      />
      <Animated.View
        style={[s.hingeHead, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: PIVOT },
            { rotate: deg },
            { translateY: -PIVOT },
          ],
        }]}
      />
      {/* Bar near shins */}
      <Animated.View style={[s.hingeBar, { transform: [{ translateY: barY }] }]}>
        <View style={[s.plateSmallL, { backgroundColor: accent }]} />
        <View style={[s.barShaft, { backgroundColor: "#888" }]} />
        <View style={[s.plateSmallR, { backgroundColor: accent }]} />
      </Animated.View>
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Lunge
// Front leg bends, body descends
// ------------------------------------------------------------------
function SceneLunge({ accent }: { accent: string }) {
  const anim = useLoop(1600);
  const bodyY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 28] });
  const backKneeY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 32] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.85] });

  return (
    <View style={s.scene}>
      {/* Back leg/knee drops */}
      <Animated.View style={[s.lungeKnee, { backgroundColor: "#e2c4a3", transform: [{ translateY: backKneeY }] }]} />
      {/* Front leg stationary */}
      <View style={[s.lungeFrontLeg, { backgroundColor: "#e2c4a3" }]} />
      {/* Body descends */}
      <Animated.View style={[s.lungeTorso, { backgroundColor: "#e2c4a3", transform: [{ translateY: bodyY }] }]} />
      <Animated.View style={[s.lungeHead, { backgroundColor: "#e2c4a3", transform: [{ translateY: bodyY }] }]} />
      {/* Dumbbells */}
      <Animated.View style={[s.lungeDumbL, { backgroundColor: accent, transform: [{ translateY: bodyY }] }]} />
      <Animated.View style={[s.lungeDumbR, { backgroundColor: accent, transform: [{ translateY: bodyY }] }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Isolation Curl (Bicep Curl)
// Forearm rotates up using pivot at elbow
// ------------------------------------------------------------------
function SceneCurl({ accent }: { accent: string }) {
  const anim = useLoop(1400);
  // Elbow sits 80px below top of scene (40 is half element height of 0)
  // Forearm element top at elbow, grows downward; pivot = top = -HALF
  const HALF = 30; // half of forearmH = 60
  const deg = anim.interpolate({ inputRange: [0, 1], outputRange: ["10deg", "-130deg"] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  return (
    <View style={s.scene}>
      {/* Standing torso */}
      <View style={[s.standHead, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standTorso, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegR, { backgroundColor: "#e2c4a3" }]} />
      {/* Upper arm stationary */}
      <View style={[s.curlUpperArm, { backgroundColor: "#e2c4a3" }]} />
      {/* Forearm + dumbbell pivot around top (elbow) */}
      <Animated.View
        style={[s.curlForearm, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: -HALF },
            { rotate: deg },
            { translateY: HALF },
          ],
        }]}
      >
        <View style={[s.curlDumbbell, { backgroundColor: accent }]} />
      </Animated.View>
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Isolation Extension (Tricep Pushdown / Skull Crusher)
// Forearm rotates down
// ------------------------------------------------------------------
function SceneExtension({ accent }: { accent: string }) {
  const anim = useLoop(1300);
  const HALF = 25;
  const deg = anim.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  return (
    <View style={s.scene}>
      <View style={[s.standHead, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standTorso, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegR, { backgroundColor: "#e2c4a3" }]} />
      {/* Cable from top */}
      <View style={[s.cableV, { backgroundColor: "#555" }]} />
      {/* Upper arm pinned down */}
      <View style={[s.extUpperArm, { backgroundColor: "#e2c4a3" }]} />
      {/* Forearm rotates from -90° (up) to 0° (down) */}
      <Animated.View
        style={[s.extForearm, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: -HALF },
            { rotate: deg },
            { translateY: HALF },
          ],
        }]}
      >
        <View style={[s.extHandle, { backgroundColor: accent }]} />
      </Animated.View>
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Isolation Raise (Lateral / Front raise)
// Both arms raise outward
// ------------------------------------------------------------------
function SceneRaise({ accent }: { accent: string }) {
  const anim = useLoop(1500);
  const HALF_ARM = 22;
  const degL = anim.interpolate({ inputRange: [0, 1], outputRange: ["15deg", "90deg"] });
  const degR = anim.interpolate({ inputRange: [0, 1], outputRange: ["-15deg", "-90deg"] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  return (
    <View style={s.scene}>
      <View style={[s.standHead, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standTorso, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.standLegR, { backgroundColor: "#e2c4a3" }]} />
      {/* Left arm */}
      <Animated.View
        style={[s.raiseArmL, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: -HALF_ARM },
            { rotate: degL },
            { translateY: HALF_ARM },
          ],
        }]}
      >
        <View style={[s.raiseDumb, { backgroundColor: accent }]} />
      </Animated.View>
      {/* Right arm */}
      <Animated.View
        style={[s.raiseArmR, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: -HALF_ARM },
            { rotate: degR },
            { translateY: HALF_ARM },
          ],
        }]}
      >
        <View style={[s.raiseDumb, { backgroundColor: accent }]} />
      </Animated.View>
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Core (Crunch / Cable Crunch)
// Upper body curls forward
// ------------------------------------------------------------------
function SceneCore({ accent }: { accent: string }) {
  const anim = useLoop(1600);
  const PIVOT = 30;
  const deg = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-32deg"] });
  const glow = anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  return (
    <View style={s.scene}>
      {/* Floor */}
      <View style={[s.floor, { backgroundColor: "#2a2a2a" }]} />
      {/* Lower body (static) */}
      <View style={[s.coreLegs, { backgroundColor: "#e2c4a3" }]} />
      {/* Upper body curls — pivot at bottom of torso */}
      <Animated.View
        style={[s.coreTorso, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: PIVOT },
            { rotate: deg },
            { translateY: -PIVOT },
          ],
        }]}
      />
      <Animated.View
        style={[s.coreHead, {
          backgroundColor: "#e2c4a3",
          transform: [
            { translateY: PIVOT + 18 },
            { rotate: deg },
            { translateY: -(PIVOT + 18) },
          ],
        }]}
      />
      <Animated.View style={[s.glowRingSmall, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Static (Plank)
// Subtle breathing scale
// ------------------------------------------------------------------
function SceneStatic({ accent }: { accent: string }) {
  const anim = useLoop(2200);
  const scaleY = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const glow = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.9, 0.3] });

  return (
    <View style={s.scene}>
      <View style={[s.floor, { backgroundColor: "#2a2a2a" }]} />
      {/* Plank body */}
      <Animated.View style={[s.plankBody, { backgroundColor: "#e2c4a3", transform: [{ scaleY }] }]} />
      <View style={[s.plankHead, { backgroundColor: "#e2c4a3" }]} />
      {/* Forearms */}
      <View style={[s.plankArmL, { backgroundColor: "#e2c4a3" }]} />
      <View style={[s.plankArmR, { backgroundColor: "#e2c4a3" }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Carry (Farmer's Walk)
// Side-to-side sway while walking
// ------------------------------------------------------------------
function SceneCarry({ accent }: { accent: string }) {
  const anim = useLoop(700);
  const sway = anim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  const legSwingL = anim.interpolate({ inputRange: [0, 1], outputRange: ["15deg", "-15deg"] });
  const legSwingR = anim.interpolate({ inputRange: [0, 1], outputRange: ["-15deg", "15deg"] });
  const glow = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });

  return (
    <View style={s.scene}>
      <Animated.View style={{ transform: [{ translateX: sway }] }}>
        <View style={[s.standHead, { backgroundColor: "#e2c4a3" }]} />
        <View style={[s.standTorso, { backgroundColor: "#e2c4a3" }]} />
        <View style={[s.carryDumbL, { backgroundColor: accent }]} />
        <View style={[s.carryDumbR, { backgroundColor: accent }]} />
      </Animated.View>
      <Animated.View style={[s.carryLegL, { backgroundColor: "#e2c4a3", transform: [{ rotate: legSwingL }] }]} />
      <Animated.View style={[s.carryLegR, { backgroundColor: "#e2c4a3", transform: [{ rotate: legSwingR }] }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Cardio (Running)
// Legs and arms swing in alternating pattern
// ------------------------------------------------------------------
function SceneCardio({ accent }: { accent: string }) {
  const anim = useLoop(550);
  const PIVOT_LEG = 22;
  const PIVOT_ARM = 18;
  const legL = anim.interpolate({ inputRange: [0, 1], outputRange: ["-35deg", "35deg"] });
  const legR = anim.interpolate({ inputRange: [0, 1], outputRange: ["35deg", "-35deg"] });
  const armL = anim.interpolate({ inputRange: [0, 1], outputRange: ["30deg", "-30deg"] });
  const armR = anim.interpolate({ inputRange: [0, 1], outputRange: ["-30deg", "30deg"] });
  const bodyBob = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -4, 0] });
  const glow = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] });

  return (
    <View style={s.scene}>
      <Animated.View style={{ transform: [{ translateY: bodyBob }] }}>
        <View style={[s.standHead, { backgroundColor: "#e2c4a3" }]} />
        <View style={[s.standTorso, { backgroundColor: "#e2c4a3" }]} />
      </Animated.View>
      {/* Arms */}
      <Animated.View style={[s.runArmL, { backgroundColor: accent, transform: [{ translateY: bodyBob }, { translateY: -PIVOT_ARM }, { rotate: armL }, { translateY: PIVOT_ARM }] }]} />
      <Animated.View style={[s.runArmR, { backgroundColor: accent, transform: [{ translateY: bodyBob }, { translateY: -PIVOT_ARM }, { rotate: armR }, { translateY: PIVOT_ARM }] }]} />
      {/* Legs */}
      <Animated.View style={[s.runLegL, { backgroundColor: "#e2c4a3", transform: [{ translateY: -PIVOT_LEG }, { rotate: legL }, { translateY: PIVOT_LEG }] }]} />
      <Animated.View style={[s.runLegR, { backgroundColor: "#e2c4a3", transform: [{ translateY: -PIVOT_LEG }, { rotate: legR }, { translateY: PIVOT_LEG }] }]} />
      <Animated.View style={[s.glowRing, { borderColor: accent, opacity: glow }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// SCENE: Default pulsing orb
// ------------------------------------------------------------------
function SceneDefault({ accent }: { accent: string }) {
  const anim = useLoop(1800);
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1.08, 0.8] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });
  return (
    <View style={s.scene}>
      <Animated.View style={[s.defaultOrb, { backgroundColor: accent, transform: [{ scale }], opacity }]} />
      <Animated.View style={[s.defaultRing, { borderColor: accent, transform: [{ scale }], opacity }]} />
    </View>
  );
}

// ------------------------------------------------------------------
// Main export
// ------------------------------------------------------------------
export function ExerciseDemo({ pattern, color }: ExerciseDemoProps) {
  const colors = useColors();
  const accent = color || colors.purple;

  const SceneMap: Record<string, React.ReactElement> = {
    horizontal_push: <SceneHorizontalPush accent={accent} />,
    vertical_push: <SceneVerticalPush accent={accent} />,
    vertical_pull: <SceneVerticalPull accent={accent} />,
    horizontal_pull: <SceneHorizontalPull accent={accent} />,
    squat: <SceneSquat accent={accent} />,
    hinge: <SceneHinge accent={accent} />,
    lunge: <SceneLunge accent={accent} />,
    isolation_curl: <SceneCurl accent={accent} />,
    isolation_extension: <SceneExtension accent={accent} />,
    isolation_raise: <SceneRaise accent={accent} />,
    core: <SceneCore accent={accent} />,
    carry: <SceneCarry accent={accent} />,
    static: <SceneStatic accent={accent} />,
    cardio: <SceneCardio accent={accent} />,
  };

  const scene = pattern ? (SceneMap[pattern] ?? <SceneDefault accent={accent} />) : <SceneDefault accent={accent} />;

  return (
    <View
      style={[
        s.container,
        { backgroundColor: colors.card, borderColor: accent + "30" },
      ]}
    >
      {scene}
    </View>
  );
}

// ------------------------------------------------------------------
// Styles — all positions are absolute within 220×220 scene
// Centre of scene = (110, 110)
// ------------------------------------------------------------------
const s = StyleSheet.create({
  container: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  scene: {
    flex: 1,
    position: "relative",
  },

  // ── Shared ──────────────────────────────────────────────────
  glowRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    left: "50%",
    top: "50%",
    marginLeft: -80,
    marginTop: -80,
  },
  glowRingSmall: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    left: "50%",
    top: "50%",
    marginLeft: -50,
    marginTop: -50,
  },
  floor: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 32,
    height: 3,
    borderRadius: 2,
  },
  barShaft: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    alignSelf: "center",
  },
  plateLeft: {
    width: 14,
    height: 36,
    borderRadius: 5,
    alignSelf: "center",
    marginRight: 2,
  },
  plateRight: {
    width: 14,
    height: 36,
    borderRadius: 5,
    alignSelf: "center",
    marginLeft: 2,
  },
  plateSmallL: {
    width: 10,
    height: 28,
    borderRadius: 4,
    alignSelf: "center",
    marginRight: 2,
  },
  plateSmallR: {
    width: 10,
    height: 28,
    borderRadius: 4,
    alignSelf: "center",
    marginLeft: 2,
  },

  // ── Standing figure (re-used across multiple scenes) ─────────
  standHead: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    left: "50%",
    marginLeft: -14,
    top: 28,
  },
  standTorso: {
    position: "absolute",
    width: 18,
    height: 52,
    borderRadius: 8,
    left: "50%",
    marginLeft: -9,
    top: 60,
  },
  standLegL: {
    position: "absolute",
    width: 10,
    height: 48,
    borderRadius: 5,
    left: "50%",
    marginLeft: -16,
    top: 112,
  },
  standLegR: {
    position: "absolute",
    width: 10,
    height: 48,
    borderRadius: 5,
    left: "50%",
    marginLeft: 6,
    top: 112,
  },

  // ── Horizontal push (bench press) ───────────────────────────
  bench: {
    position: "absolute",
    left: 30,
    right: 30,
    top: 138,
    height: 14,
    borderRadius: 7,
  },
  benchBody: {
    position: "absolute",
    left: 40,
    right: 50,
    top: 116,
    height: 22,
    borderRadius: 8,
  },
  benchHead: {
    position: "absolute",
    right: 34,
    top: 108,
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  barbellRow: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 72,
    flexDirection: "row",
    alignItems: "center",
    height: 36,
  },
  armLeft: {
    position: "absolute",
    left: "38%",
    width: 7,
    height: 44,
    borderRadius: 4,
    top: 86,
  },
  armRight: {
    position: "absolute",
    right: "38%",
    width: 7,
    height: 44,
    borderRadius: 4,
    top: 86,
  },

  // ── Vertical push (overhead press) ──────────────────────────
  ohBarbell: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 122,
    flexDirection: "row",
    alignItems: "center",
    height: 36,
  },
  ohArmL: {
    position: "absolute",
    left: "38%",
    width: 7,
    height: 52,
    borderRadius: 4,
    top: 74,
  },
  ohArmR: {
    position: "absolute",
    right: "38%",
    width: 7,
    height: 52,
    borderRadius: 4,
    top: 74,
  },

  // ── Vertical pull (pull-up) ─────────────────────────────────
  pullBar: {
    position: "absolute",
    left: 28,
    right: 28,
    top: 24,
    height: 8,
    borderRadius: 4,
  },
  pullHead: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    left: "50%",
    marginLeft: -13,
    top: 58,
  },
  pullTorso: {
    position: "absolute",
    width: 16,
    height: 42,
    borderRadius: 7,
    left: "50%",
    marginLeft: -8,
    top: 88,
  },
  pullLegL: {
    position: "absolute",
    width: 8,
    height: 40,
    borderRadius: 4,
    left: "50%",
    marginLeft: -14,
    top: 130,
  },
  pullLegR: {
    position: "absolute",
    width: 8,
    height: 40,
    borderRadius: 4,
    left: "50%",
    marginLeft: 6,
    top: 130,
  },
  pullArmL: {
    position: "absolute",
    width: 7,
    height: 38,
    borderRadius: 4,
    left: "50%",
    marginLeft: -26,
    top: 28,
  },
  pullArmR: {
    position: "absolute",
    width: 7,
    height: 38,
    borderRadius: 4,
    left: "50%",
    marginLeft: 18,
    top: 28,
  },

  // ── Horizontal pull (bent-over row) ─────────────────────────
  rowTorso: {
    position: "absolute",
    width: 70,
    height: 14,
    borderRadius: 7,
    left: "50%",
    marginLeft: -35,
    top: 90,
    transform: [{ rotate: "30deg" }],
  },
  rowHead: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    left: "25%",
    top: 70,
  },
  rowLegL: {
    position: "absolute",
    width: 10,
    height: 54,
    borderRadius: 5,
    left: "50%",
    marginLeft: -18,
    top: 100,
  },
  rowLegR: {
    position: "absolute",
    width: 10,
    height: 54,
    borderRadius: 5,
    left: "50%",
    marginLeft: 8,
    top: 100,
  },
  rowHandle: {
    position: "absolute",
    width: 20,
    height: 8,
    borderRadius: 4,
    left: "20%",
    top: 94,
  },
  rowArm: {
    position: "absolute",
    width: 7,
    height: 32,
    borderRadius: 4,
    left: "28%",
    top: 86,
    transform: [{ rotate: "20deg" }],
  },
  cableH: {
    position: "absolute",
    left: 10,
    width: "24%",
    height: 2,
    top: 97,
  },
  cableV: {
    position: "absolute",
    width: 2,
    height: 80,
    left: "50%",
    marginLeft: 18,
    top: 0,
  },

  // ── Squat ───────────────────────────────────────────────────
  sqHead: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    left: "50%",
    marginLeft: -14,
    top: 28,
  },
  sqBarbell: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 58,
    flexDirection: "row",
    alignItems: "center",
    height: 30,
  },
  sqTorso: {
    position: "absolute",
    width: 20,
    height: 50,
    borderRadius: 8,
    left: "50%",
    marginLeft: -10,
    top: 88,
  },
  sqLegL: {
    position: "absolute",
    width: 12,
    height: 44,
    borderRadius: 5,
    left: "50%",
    marginLeft: -20,
    top: 138,
  },
  sqLegR: {
    position: "absolute",
    width: 12,
    height: 44,
    borderRadius: 5,
    left: "50%",
    marginLeft: 8,
    top: 138,
  },

  // ── Hinge ───────────────────────────────────────────────────
  hingeLegL: {
    position: "absolute",
    width: 12,
    height: 72,
    borderRadius: 5,
    left: "50%",
    marginLeft: -20,
    top: 110,
  },
  hingeLegR: {
    position: "absolute",
    width: 12,
    height: 72,
    borderRadius: 5,
    left: "50%",
    marginLeft: 8,
    top: 110,
  },
  hingeTorso: {
    position: "absolute",
    width: 16,
    height: 60,
    borderRadius: 7,
    left: "50%",
    marginLeft: -8,
    top: 52,
  },
  hingeHead: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    left: "50%",
    marginLeft: -13,
    top: 28,
  },
  hingeBar: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 154,
    flexDirection: "row",
    alignItems: "center",
    height: 28,
  },

  // ── Lunge ───────────────────────────────────────────────────
  lungeKnee: {
    position: "absolute",
    width: 10,
    height: 52,
    borderRadius: 5,
    left: "30%",
    top: 128,
  },
  lungeFrontLeg: {
    position: "absolute",
    width: 12,
    height: 64,
    borderRadius: 5,
    left: "55%",
    top: 116,
  },
  lungeTorso: {
    position: "absolute",
    width: 18,
    height: 48,
    borderRadius: 8,
    left: "50%",
    marginLeft: -9,
    top: 72,
  },
  lungeHead: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    left: "50%",
    marginLeft: -13,
    top: 46,
  },
  lungeDumbL: {
    position: "absolute",
    width: 12,
    height: 22,
    borderRadius: 4,
    left: "32%",
    top: 88,
  },
  lungeDumbR: {
    position: "absolute",
    width: 12,
    height: 22,
    borderRadius: 4,
    right: "28%",
    top: 88,
  },

  // ── Isolation Curl ───────────────────────────────────────────
  curlUpperArm: {
    position: "absolute",
    width: 8,
    height: 36,
    borderRadius: 4,
    left: "60%",
    top: 76,
  },
  curlForearm: {
    position: "absolute",
    width: 8,
    height: 60,
    borderRadius: 4,
    left: "60%",
    top: 112,
  },
  curlDumbbell: {
    position: "absolute",
    bottom: -12,
    left: -10,
    width: 28,
    height: 14,
    borderRadius: 5,
  },

  // ── Isolation Extension ─────────────────────────────────────
  extUpperArm: {
    position: "absolute",
    width: 8,
    height: 40,
    borderRadius: 4,
    left: "56%",
    top: 64,
  },
  extForearm: {
    position: "absolute",
    width: 8,
    height: 50,
    borderRadius: 4,
    left: "56%",
    top: 104,
  },
  extHandle: {
    position: "absolute",
    bottom: -10,
    left: -10,
    width: 28,
    height: 12,
    borderRadius: 5,
  },

  // ── Isolation Raise ──────────────────────────────────────────
  raiseArmL: {
    position: "absolute",
    width: 8,
    height: 44,
    borderRadius: 4,
    left: "50%",
    marginLeft: -30,
    top: 72,
  },
  raiseArmR: {
    position: "absolute",
    width: 8,
    height: 44,
    borderRadius: 4,
    left: "50%",
    marginLeft: 22,
    top: 72,
  },
  raiseDumb: {
    position: "absolute",
    bottom: -10,
    left: -8,
    width: 24,
    height: 14,
    borderRadius: 5,
  },

  // ── Core ─────────────────────────────────────────────────────
  coreLegs: {
    position: "absolute",
    left: "30%",
    right: "20%",
    top: 148,
    height: 14,
    borderRadius: 5,
  },
  coreTorso: {
    position: "absolute",
    width: 16,
    height: 52,
    borderRadius: 8,
    left: "45%",
    top: 96,
  },
  coreHead: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    left: "44%",
    top: 72,
  },

  // ── Plank (static) ───────────────────────────────────────────
  plankBody: {
    position: "absolute",
    left: "20%",
    right: "22%",
    top: 112,
    height: 16,
    borderRadius: 7,
  },
  plankHead: {
    position: "absolute",
    right: "16%",
    top: 100,
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  plankArmL: {
    position: "absolute",
    left: "22%",
    top: 128,
    width: 7,
    height: 28,
    borderRadius: 4,
  },
  plankArmR: {
    position: "absolute",
    left: "38%",
    top: 128,
    width: 7,
    height: 28,
    borderRadius: 4,
  },

  // ── Carry ────────────────────────────────────────────────────
  carryDumbL: {
    position: "absolute",
    left: "30%",
    top: 74,
    width: 12,
    height: 36,
    borderRadius: 5,
  },
  carryDumbR: {
    position: "absolute",
    right: "30%",
    top: 74,
    width: 12,
    height: 36,
    borderRadius: 5,
  },
  carryLegL: {
    position: "absolute",
    left: "50%",
    marginLeft: -16,
    top: 112,
    width: 10,
    height: 52,
    borderRadius: 5,
  },
  carryLegR: {
    position: "absolute",
    left: "50%",
    marginLeft: 6,
    top: 112,
    width: 10,
    height: 52,
    borderRadius: 5,
  },

  // ── Cardio (running) ─────────────────────────────────────────
  runArmL: {
    position: "absolute",
    left: "50%",
    marginLeft: -22,
    top: 68,
    width: 7,
    height: 36,
    borderRadius: 4,
  },
  runArmR: {
    position: "absolute",
    left: "50%",
    marginLeft: 14,
    top: 68,
    width: 7,
    height: 36,
    borderRadius: 4,
  },
  runLegL: {
    position: "absolute",
    left: "50%",
    marginLeft: -18,
    top: 114,
    width: 10,
    height: 56,
    borderRadius: 5,
  },
  runLegR: {
    position: "absolute",
    left: "50%",
    marginLeft: 8,
    top: 114,
    width: 10,
    height: 56,
    borderRadius: 5,
  },

  // ── Default orb ──────────────────────────────────────────────
  defaultOrb: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    left: "50%",
    top: "50%",
    marginLeft: -32,
    marginTop: -32,
  },
  defaultRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    left: "50%",
    top: "50%",
    marginLeft: -50,
    marginTop: -50,
  },
});
