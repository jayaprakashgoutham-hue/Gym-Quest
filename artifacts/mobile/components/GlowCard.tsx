import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlowCardProps {
  children: React.ReactNode;
  glowColor?: string;
  style?: ViewStyle;
}

export function GlowCard({ children, glowColor, style }: GlowCardProps) {
  const colors = useColors();
  const glow = glowColor || colors.purple;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: glow + "30" }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
});
