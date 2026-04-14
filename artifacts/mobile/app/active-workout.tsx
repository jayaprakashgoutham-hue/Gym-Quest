import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Platform, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import { RestTimer } from "@/components/RestTimer";
import * as Haptics from "expo-haptics";
import type { LoggedExercise, LoggedSet } from "@/store/types";

export default function ActiveWorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { workouts, exercises, profile, addLog, checkAndUnlockAchievements } = useApp();

  const workout = workouts.find((w) => w.id === workoutId);

  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (workout) {
      setLoggedExercises(
        workout.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: Array.from({ length: ex.sets }, () => ({
            reps: ex.reps,
            weight: ex.weight,
            completed: false,
          })),
        }))
      );
    }
  }, [workout]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getExName = (id: string) => exercises.find((e) => e.id === id)?.name || "Unknown";

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: string) => {
    setLoggedExercises((prev) => {
      const next = [...prev];
      const sets = [...next[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: parseFloat(value) || 0 };
      next[exIdx] = { ...next[exIdx], sets };
      return next;
    });
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    setLoggedExercises((prev) => {
      const next = [...prev];
      const sets = [...next[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], completed: !sets[setIdx].completed };
      next[exIdx] = { ...next[exIdx], sets };
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowRestTimer(true);
  };

  const finishWorkout = () => {
    if (!workout) return;
    const logId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const log = {
      id: logId,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString().split("T")[0],
      duration: Math.round(elapsed / 60),
      exercises: loggedExercises,
    };
    addLog(log);
    const unlockedNames = checkAndUnlockAchievements(log);
    if (unlockedNames.length > 0) {
      Alert.alert("Achievement Unlocked!", unlockedNames.join(", "));
    }
    router.back();
  };

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Workout not found</Text>
        <NeonButton title="Go Back" onPress={() => router.back()} color={colors.purple} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPadding + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={[styles.workoutTitle, { color: colors.foreground }]}>{workout.name}</Text>
          <Text style={[styles.timer, { color: colors.cyan }]}>
            {mins}:{secs.toString().padStart(2, "0")}
          </Text>
        </View>
        <TouchableOpacity onPress={finishWorkout} style={[styles.finishBtn, { backgroundColor: colors.lime }]}>
          <Feather name="check" size={18} color="#0a0a0a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <RestTimer
          duration={profile.restTimerDuration}
          onComplete={() => setShowRestTimer(false)}
          visible={showRestTimer}
        />

        {loggedExercises.map((logEx, exIdx) => (
          <GlowCard key={exIdx} glowColor={colors.purple}>
            <Text style={[styles.exName, { color: colors.foreground }]}>
              {getExName(logEx.exerciseId)}
            </Text>
            <View style={styles.setHeader}>
              <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>SET</Text>
              <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>REPS</Text>
              <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>
                {profile.weightUnit.toUpperCase()}
              </Text>
              <Text style={[styles.setLabel, { color: colors.mutedForeground, width: 40 }]} />
            </View>
            {logEx.sets.map((set, setIdx) => (
              <View key={setIdx} style={styles.setRow}>
                <Text style={[styles.setNum, { color: colors.mutedForeground }]}>{setIdx + 1}</Text>
                <TextInput
                  style={[
                    styles.setInput,
                    {
                      backgroundColor: colors.input,
                      color: colors.foreground,
                      borderColor: set.completed ? colors.lime + "50" : colors.border,
                    },
                  ]}
                  value={set.reps.toString()}
                  onChangeText={(v) => updateSet(exIdx, setIdx, "reps", v)}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={[
                    styles.setInput,
                    {
                      backgroundColor: colors.input,
                      color: colors.foreground,
                      borderColor: set.completed ? colors.lime + "50" : colors.border,
                    },
                  ]}
                  value={set.weight.toString()}
                  onChangeText={(v) => updateSet(exIdx, setIdx, "weight", v)}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  onPress={() => toggleSetComplete(exIdx, setIdx)}
                  style={[
                    styles.checkBtn,
                    {
                      backgroundColor: set.completed ? colors.lime : colors.secondary,
                    },
                  ]}
                >
                  <Feather
                    name="check"
                    size={16}
                    color={set.completed ? "#0a0a0a" : colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </GlowCard>
        ))}

        <NeonButton
          title="Finish Workout"
          onPress={finishWorkout}
          color={colors.lime}
          style={{ marginTop: 8 }}
          textStyle={{ color: "#0a0a0a" }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topBarCenter: { flex: 1, alignItems: "center" as const },
  workoutTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  timer: { fontSize: 22, fontFamily: "Inter_700Bold" },
  finishBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 16, paddingHorizontal: 20 },
  exName: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  setHeader: {
    flexDirection: "row" as const,
    marginBottom: 6,
    paddingHorizontal: 4,
    gap: 8,
  },
  setLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textAlign: "center" as const,
  },
  setRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 6,
  },
  setNum: {
    width: 24,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center" as const,
  },
  setInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    textAlign: "center" as const,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    borderWidth: 1,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
