import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  visible: boolean;
}

export function RestTimer({ duration, onComplete, visible }: RestTimerProps) {
  const colors = useColors();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setTimeLeft(duration);
      setRunning(true);
    } else {
      setRunning(false);
    }
  }, [visible, duration]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft]);

  const skipTimer = useCallback(() => {
    setRunning(false);
    setTimeLeft(0);
    onComplete();
  }, [onComplete]);

  if (!visible) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cyan + "40" }]}>
      <Animated.Text
        style={[
          styles.time,
          { color: timeLeft <= 5 ? colors.pink : colors.cyan, transform: [{ scale: pulseAnim }] },
        ]}
      >
        {mins}:{secs.toString().padStart(2, "0")}
      </Animated.Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>REST</Text>
      <TouchableOpacity onPress={skipTimer} style={[styles.skip, { backgroundColor: colors.secondary }]}>
        <Feather name="skip-forward" size={16} color={colors.foreground} />
        <Text style={[styles.skipText, { color: colors.foreground }]}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    marginVertical: 8,
  },
  time: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
    marginTop: 4,
  },
  skip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
