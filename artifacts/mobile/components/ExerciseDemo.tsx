import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { MovementPattern } from "@/store/types";

interface ExerciseDemoProps {
  pattern?: MovementPattern;
  color?: string;
}

const DURATION = 1600;

export function ExerciseDemo({ pattern, color }: ExerciseDemoProps) {
  const colors = useColors();
  const accent = color || colors.purple;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: accent + "30" }]}>
      {renderPattern(pattern, anim, accent, colors)}
    </View>
  );
}

function renderPattern(
  pattern: MovementPattern | undefined,
  anim: Animated.Value,
  accent: string,
  colors: ReturnType<typeof useColors>
) {
  const skin = "#e2c4a3";
  const muted = colors.mutedForeground;

  switch (pattern) {
    case "horizontal_push": {
      // Lying on bench, pressing bar up/down
      const barTop = anim.interpolate({ inputRange: [0, 1], outputRange: [110, 60] });
      return (
        <>
          {/* Bench */}
          <View style={[styles.bench, { backgroundColor: muted + "55" }]} />
          {/* Body */}
          <View style={[styles.bodyLying, { backgroundColor: skin }]} />
          {/* Head */}
          <View style={[styles.headLying, { backgroundColor: skin }]} />
          {/* Bar */}
          <Animated.View style={[styles.barH, { backgroundColor: accent, top: barTop }]} />
          {/* Plates */}
          <Animated.View style={[styles.plateL, { backgroundColor: accent, top: barTop }]} />
          <Animated.View style={[styles.plateR, { backgroundColor: accent, top: barTop }]} />
        </>
      );
    }
    case "vertical_push": {
      // Standing overhead press
      const barTop = anim.interpolate({ inputRange: [0, 1], outputRange: [105, 35] });
      return (
        <>
          {/* Body */}
          <View style={[styles.bodyStanding, { backgroundColor: skin }]} />
          <View style={[styles.headStanding, { backgroundColor: skin }]} />
          <View style={[styles.legsStanding, { backgroundColor: skin }]} />
          {/* Bar */}
          <Animated.View style={[styles.barH, { backgroundColor: accent, top: barTop }]} />
          <Animated.View style={[styles.plateL, { backgroundColor: accent, top: barTop }]} />
          <Animated.View style={[styles.plateR, { backgroundColor: accent, top: barTop }]} />
        </>
      );
    }
    case "vertical_pull": {
      // Pull-up: body moves up toward fixed bar
      const bodyTop = anim.interpolate({ inputRange: [0, 1], outputRange: [85, 55] });
      return (
        <>
          {/* Fixed bar */}
          <View style={[styles.fixedBar, { backgroundColor: muted }]} />
          {/* Body */}
          <Animated.View style={[styles.pullupBody, { backgroundColor: skin, top: bodyTop }]} />
          <Animated.View style={[styles.pullupHead, { backgroundColor: skin, top: bodyTop }]} />
          <Animated.View style={[styles.pullupArmL, { backgroundColor: accent, top: bodyTop }]} />
          <Animated.View style={[styles.pullupArmR, { backgroundColor: accent, top: bodyTop }]} />
        </>
      );
    }
    case "horizontal_pull": {
      // Bent-over row: bar moves toward chest
      const barLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 110] });
      return (
        <>
          <View style={[styles.bentBody, { backgroundColor: skin }]} />
          <View style={[styles.bentHead, { backgroundColor: skin }]} />
          <Animated.View style={[styles.barV, { backgroundColor: accent, left: barLeft }]} />
        </>
      );
    }
    case "squat": {
      // Body moves down/up
      const bodyTop = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 85] });
      const bodyHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [100, 55] });
      return (
        <>
          {/* Body */}
          <Animated.View
            style={[
              styles.squatBody,
              { backgroundColor: skin, top: bodyTop, height: bodyHeight },
            ]}
          />
          {/* Head */}
          <Animated.View style={[styles.squatHead, { backgroundColor: skin, top: bodyTop }]} />
          {/* Bar on shoulders */}
          <Animated.View style={[styles.squatBar, { backgroundColor: accent, top: bodyTop }]} />
          <Animated.View style={[styles.squatPlateL, { backgroundColor: accent, top: bodyTop }]} />
          <Animated.View style={[styles.squatPlateR, { backgroundColor: accent, top: bodyTop }]} />
        </>
      );
    }
    case "hinge": {
      // Body bends forward at hips
      const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "65deg"] });
      const barTop = anim.interpolate({ inputRange: [0, 1], outputRange: [55, 130] });
      return (
        <>
          {/* Legs (stationary) */}
          <View style={[styles.hingeLegs, { backgroundColor: skin }]} />
          {/* Torso (rotating) */}
          <Animated.View
            style={[
              styles.hingeTorso,
              {
                backgroundColor: skin,
                transform: [
                  { translateX: -10 },
                  { translateY: -50 },
                  { rotate },
                  { translateX: 10 },
                  { translateY: 50 },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.hingeHead,
              {
                backgroundColor: skin,
                transform: [
                  { translateX: -10 },
                  { translateY: -65 },
                  { rotate },
                  { translateX: 10 },
                  { translateY: 65 },
                ],
              },
            ]}
          />
          {/* Bar moves with torso */}
          <Animated.View style={[styles.barH, { backgroundColor: accent, top: barTop }]} />
          <Animated.View style={[styles.plateL, { backgroundColor: accent, top: barTop }]} />
          <Animated.View style={[styles.plateR, { backgroundColor: accent, top: barTop }]} />
        </>
      );
    }
    case "lunge": {
      // Body up/down with split stance
      const bodyTop = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 75] });
      return (
        <>
          {/* Front leg */}
          <View style={[styles.lungeLegFront, { backgroundColor: skin }]} />
          {/* Back leg */}
          <View style={[styles.lungeLegBack, { backgroundColor: skin }]} />
          {/* Body */}
          <Animated.View style={[styles.lungeBody, { backgroundColor: skin, top: bodyTop }]} />
          <Animated.View style={[styles.lungeHead, { backgroundColor: skin, top: bodyTop }]} />
        </>
      );
    }
    case "isolation_curl": {
      // Forearm rotates up to shoulder
      const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-150deg"] });
      return (
        <>
          {/* Standing body */}
          <View style={[styles.bodyStanding, { backgroundColor: skin }]} />
          <View style={[styles.headStanding, { backgroundColor: skin }]} />
          <View style={[styles.legsStanding, { backgroundColor: skin }]} />
          {/* Upper arm */}
          <View style={[styles.upperArm, { backgroundColor: skin }]} />
          {/* Forearm + dumbbell rotating around elbow */}
          <Animated.View
            style={[
              styles.curlForearm,
              { backgroundColor: skin, transform: [{ rotate }] },
            ]}
          >
            <View style={[styles.curlDumbbell, { backgroundColor: accent }]} />
          </Animated.View>
        </>
      );
    }
    case "isolation_extension": {
      // Forearm rotates down (tricep pushdown)
      const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] });
      return (
        <>
          <View style={[styles.bodyStanding, { backgroundColor: skin }]} />
          <View style={[styles.headStanding, { backgroundColor: skin }]} />
          <View style={[styles.legsStanding, { backgroundColor: skin }]} />
          {/* Cable line */}
          <View style={[styles.cableLine, { backgroundColor: muted }]} />
          {/* Upper arm */}
          <View style={[styles.upperArm, { backgroundColor: skin }]} />
          {/* Forearm */}
          <Animated.View
            style={[styles.curlForearm, { backgroundColor: skin, transform: [{ rotate }] }]}
          >
            <View style={[styles.curlDumbbell, { backgroundColor: accent }]} />
          </Animated.View>
        </>
      );
    }
    case "isolation_raise": {
      // Arms raise out to sides
      const rotateL = anim.interpolate({ inputRange: [0, 1], outputRange: ["20deg", "90deg"] });
      const rotateR = anim.interpolate({ inputRange: [0, 1], outputRange: ["-20deg", "-90deg"] });
      return (
        <>
          <View style={[styles.bodyStanding, { backgroundColor: skin }]} />
          <View style={[styles.headStanding, { backgroundColor: skin }]} />
          <View style={[styles.legsStanding, { backgroundColor: skin }]} />
          <Animated.View
            style={[
              styles.raiseArmL,
              { backgroundColor: skin, transform: [{ rotate: rotateL }] },
            ]}
          >
            <View style={[styles.raiseDumbbell, { backgroundColor: accent }]} />
          </Animated.View>
          <Animated.View
            style={[
              styles.raiseArmR,
              { backgroundColor: skin, transform: [{ rotate: rotateR }] },
            ]}
          >
            <View style={[styles.raiseDumbbell, { backgroundColor: accent }]} />
          </Animated.View>
        </>
      );
    }
    case "core": {
      // Crunch/curl up
      const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-30deg"] });
      return (
        <>
          {/* Lower body */}
          <View style={[styles.coreLegs, { backgroundColor: skin }]} />
          {/* Torso pivoting at hip */}
          <Animated.View
            style={[
              styles.coreTorso,
              {
                backgroundColor: skin,
                transform: [
                  { translateY: 30 },
                  { rotate },
                  { translateY: -30 },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.coreHead,
              {
                backgroundColor: skin,
                transform: [
                  { translateY: 50 },
                  { rotate },
                  { translateY: -50 },
                ],
              },
            ]}
          />
          {/* Floor line */}
          <View style={[styles.floor, { backgroundColor: muted + "55" }]} />
        </>
      );
    }
    case "carry": {
      // Standing with weights, slight side-to-side sway
      const sway = anim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });
      return (
        <Animated.View style={{ width: "100%", height: "100%", transform: [{ translateX: sway }] }}>
          <View style={[styles.bodyStanding, { backgroundColor: skin }]} />
          <View style={[styles.headStanding, { backgroundColor: skin }]} />
          <View style={[styles.legsStanding, { backgroundColor: skin }]} />
          <View style={[styles.carryDumbbellL, { backgroundColor: accent }]} />
          <View style={[styles.carryDumbbellR, { backgroundColor: accent }]} />
        </Animated.View>
      );
    }
    case "static": {
      // Plank pose with subtle breathing
      const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
      return (
        <Animated.View style={{ transform: [{ scale }], width: "100%", height: "100%" }}>
          <View style={[styles.plankBody, { backgroundColor: skin }]} />
          <View style={[styles.plankHead, { backgroundColor: skin }]} />
          <View style={[styles.floor, { backgroundColor: muted + "55" }]} />
        </Animated.View>
      );
    }
    case "cardio": {
      // Running stick figure with leg swing
      const rotateLegL = anim.interpolate({ inputRange: [0, 1], outputRange: ["-30deg", "30deg"] });
      const rotateLegR = anim.interpolate({ inputRange: [0, 1], outputRange: ["30deg", "-30deg"] });
      const rotateArmL = anim.interpolate({ inputRange: [0, 1], outputRange: ["30deg", "-30deg"] });
      const rotateArmR = anim.interpolate({ inputRange: [0, 1], outputRange: ["-30deg", "30deg"] });
      return (
        <>
          <View style={[styles.bodyStanding, { backgroundColor: skin }]} />
          <View style={[styles.headStanding, { backgroundColor: skin }]} />
          <Animated.View
            style={[styles.cardioLegL, { backgroundColor: skin, transform: [{ rotate: rotateLegL }] }]}
          />
          <Animated.View
            style={[styles.cardioLegR, { backgroundColor: skin, transform: [{ rotate: rotateLegR }] }]}
          />
          <Animated.View
            style={[styles.cardioArmL, { backgroundColor: accent, transform: [{ rotate: rotateArmL }] }]}
          />
          <Animated.View
            style={[styles.cardioArmR, { backgroundColor: accent, transform: [{ rotate: rotateArmR }] }]}
          />
        </>
      );
    }
    default: {
      // Generic pulse
      const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
      const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
      return (
        <Animated.View
          style={{
            position: "absolute" as const,
            top: "30%",
            left: "30%",
            width: "40%",
            height: "40%",
            borderRadius: 999,
            backgroundColor: accent,
            transform: [{ scale }],
            opacity,
          }}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },

  // ---- Lying / Bench ----
  bench: { position: "absolute", left: "15%", right: "15%", top: 130, height: 12, borderRadius: 6 },
  bodyLying: { position: "absolute", left: "20%", right: "30%", top: 110, height: 24, borderRadius: 8 },
  headLying: { position: "absolute", right: "20%", top: 105, width: 28, height: 28, borderRadius: 14 },
  barH: { position: "absolute", left: "25%", right: "25%", height: 6, borderRadius: 3 },
  plateL: { position: "absolute", left: "18%", width: 12, height: 24, borderRadius: 4 },
  plateR: { position: "absolute", right: "18%", width: 12, height: 24, borderRadius: 4 },

  // ---- Standing body ----
  bodyStanding: { position: "absolute", left: "45%", right: "45%", top: 75, height: 50, borderRadius: 6 },
  headStanding: { position: "absolute", left: "47%", right: "47%", top: 45, width: 28, height: 28, borderRadius: 14, marginLeft: -3 },
  legsStanding: { position: "absolute", left: "45%", right: "45%", top: 125, height: 50, borderRadius: 4 },
  upperArm: { position: "absolute", left: "55%", top: 80, width: 6, height: 35, borderRadius: 3 },

  // ---- Pull-up ----
  fixedBar: { position: "absolute", left: "20%", right: "20%", top: 30, height: 6, borderRadius: 3 },
  pullupBody: { position: "absolute", left: "47%", right: "47%", height: 40, borderRadius: 6 },
  pullupHead: { position: "absolute", left: "47%", right: "47%", marginTop: -28, width: 28, height: 28, borderRadius: 14, marginLeft: -3 },
  pullupArmL: { position: "absolute", left: "40%", marginTop: -25, width: 4, height: 50, borderRadius: 2 },
  pullupArmR: { position: "absolute", right: "40%", marginTop: -25, width: 4, height: 50, borderRadius: 2 },

  // ---- Bent-over ----
  bentBody: { position: "absolute", left: "30%", right: "30%", top: 70, height: 14, borderRadius: 6 },
  bentHead: { position: "absolute", left: "20%", top: 60, width: 26, height: 26, borderRadius: 13 },
  barV: { position: "absolute", top: 95, width: 6, height: 50, borderRadius: 3 },

  // ---- Squat ----
  squatBody: { position: "absolute", left: "44%", right: "44%", borderRadius: 6 },
  squatHead: { position: "absolute", left: "47%", right: "47%", marginTop: -30, width: 28, height: 28, borderRadius: 14, marginLeft: -3 },
  squatBar: { position: "absolute", left: "20%", right: "20%", height: 6, borderRadius: 3 },
  squatPlateL: { position: "absolute", left: "13%", width: 12, height: 24, borderRadius: 4 },
  squatPlateR: { position: "absolute", right: "13%", width: 12, height: 24, borderRadius: 4 },

  // ---- Hinge ----
  hingeLegs: { position: "absolute", left: "45%", right: "45%", top: 100, height: 70, borderRadius: 4 },
  hingeTorso: { position: "absolute", left: "44%", right: "44%", top: 50, height: 55, borderRadius: 6 },
  hingeHead: { position: "absolute", left: "47%", right: "47%", top: 25, width: 28, height: 28, borderRadius: 14, marginLeft: -3 },

  // ---- Lunge ----
  lungeLegFront: { position: "absolute", left: "55%", top: 115, width: 8, height: 60, borderRadius: 4 },
  lungeLegBack: { position: "absolute", right: "55%", top: 115, width: 8, height: 60, borderRadius: 4, transform: [{ rotate: "20deg" }] },
  lungeBody: { position: "absolute", left: "47%", right: "47%", height: 50, borderRadius: 6 },
  lungeHead: { position: "absolute", left: "47%", right: "47%", marginTop: -30, width: 28, height: 28, borderRadius: 14, marginLeft: -3 },

  // ---- Curl/Extension ----
  curlForearm: {
    position: "absolute",
    left: "55%",
    top: 110,
    width: 6,
    height: 40,
    borderRadius: 3,
    transformOrigin: "top",
  },
  curlDumbbell: { position: "absolute", bottom: -8, left: -6, width: 18, height: 18, borderRadius: 4 },
  cableLine: { position: "absolute", left: "55%", top: 0, width: 2, height: 80, marginLeft: 1 },

  // ---- Lateral raise ----
  raiseArmL: { position: "absolute", left: "47%", top: 80, width: 5, height: 45, borderRadius: 3, transformOrigin: "top" },
  raiseArmR: { position: "absolute", right: "47%", top: 80, width: 5, height: 45, borderRadius: 3, transformOrigin: "top" },
  raiseDumbbell: { position: "absolute", bottom: -8, left: -7, width: 18, height: 18, borderRadius: 4 },

  // ---- Core ----
  coreLegs: { position: "absolute", right: "20%", top: 130, width: 80, height: 14, borderRadius: 4 },
  coreTorso: { position: "absolute", left: "30%", top: 110, width: 60, height: 16, borderRadius: 6, transformOrigin: "right" },
  coreHead: { position: "absolute", left: "27%", top: 95, width: 26, height: 26, borderRadius: 13, transformOrigin: "right" },
  floor: { position: "absolute", left: 0, right: 0, bottom: 30, height: 2 },

  // ---- Plank ----
  plankBody: { position: "absolute", left: "20%", right: "20%", top: 110, height: 14, borderRadius: 6 },
  plankHead: { position: "absolute", right: "16%", top: 100, width: 24, height: 24, borderRadius: 12 },

  // ---- Carry ----
  carryDumbbellL: { position: "absolute", left: "32%", top: 95, width: 16, height: 28, borderRadius: 4 },
  carryDumbbellR: { position: "absolute", right: "32%", top: 95, width: 16, height: 28, borderRadius: 4 },

  // ---- Cardio ----
  cardioLegL: { position: "absolute", left: "47%", top: 120, width: 5, height: 55, borderRadius: 3, transformOrigin: "top" },
  cardioLegR: { position: "absolute", right: "47%", top: 120, width: 5, height: 55, borderRadius: 3, transformOrigin: "top" },
  cardioArmL: { position: "absolute", left: "47%", top: 80, width: 5, height: 35, borderRadius: 3, transformOrigin: "top" },
  cardioArmR: { position: "absolute", right: "47%", top: 80, width: 5, height: 35, borderRadius: 3, transformOrigin: "top" },
});
