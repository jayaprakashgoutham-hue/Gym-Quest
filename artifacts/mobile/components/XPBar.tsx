import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface XPBarProps {
  xp: number;
  level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
  const colors = useColors();
  const xpForLevel = 300;
  const currentXP = xp % xpForLevel;
  const progress = currentXP / xpForLevel;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.level, { color: colors.cyan }]}>LVL {level}</Text>
        <Text style={[styles.xpText, { color: colors.mutedForeground }]}>
          {currentXP} / {xpForLevel} XP
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(progress * 100, 100)}%` as any,
              backgroundColor: colors.cyan,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 6,
  },
  level: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  xpText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  fill: {
    height: "100%" as any,
    borderRadius: 4,
  },
});
