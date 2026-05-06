import React, { useRef } from "react";
import {
  View, StyleSheet, Animated, TouchableOpacity, Text, ViewStyle,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  style?: ViewStyle;
}

export function SwipeableCard({
  children,
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  style,
}: SwipeableCardProps) {
  const colors = useColors();
  const swipeRef = useRef<Swipeable>(null);

  const close = () => swipeRef.current?.close();

  const renderLeft = onEdit
    ? (progress: Animated.AnimatedInterpolation<number>) => {
        const scale = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
          extrapolate: "clamp",
        });
        return (
          <Animated.View style={[styles.leftAction, { transform: [{ scale }] }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#06b6d4" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                close();
                onEdit?.();
              }}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={20} color="#fff" />
              <Text style={styles.actionText}>{editLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }
    : undefined;

  const renderRight = onDelete
    ? (progress: Animated.AnimatedInterpolation<number>) => {
        const scale = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
          extrapolate: "clamp",
        });
        return (
          <Animated.View style={[styles.rightAction, { transform: [{ scale }] }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#f43f5e" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                close();
                onDelete?.();
              }}
              activeOpacity={0.8}
            >
              <Feather name="trash-2" size={20} color="#fff" />
              <Text style={styles.actionText}>{deleteLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }
    : undefined;

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeft}
      renderRightActions={renderRight}
      leftThreshold={60}
      rightThreshold={60}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(direction) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View style={[{ backgroundColor: "#141414" }, style]}>{children}</View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    justifyContent: "center" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden" as const,
  },
  rightAction: {
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden" as const,
  },
  actionBtn: {
    width: 80,
    minHeight: 72,
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
