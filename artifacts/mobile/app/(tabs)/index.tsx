import React, { useMemo, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { useRouter } from "expo-router";

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workouts, exercises } = useApp();
  const router = useRouter();

  const grouped = useMemo(() => {
    const groups: Record<string, typeof workouts> = {};
    workouts.forEach((w) => {
      if (!groups[w.groupName]) groups[w.groupName] = [];
      groups[w.groupName].push(w);
    });
    return groups;
  }, [workouts]);

  const getExerciseName = useCallback(
    (id: string) => exercises.find((e) => e.id === id)?.name || "Unknown",
    [exercises]
  );

  const openNewWorkout = (group?: string) => {
    router.push({
      pathname: "/workout/[id]",
      params: { id: "new", isNew: "1", ...(group ? { group } : {}) },
    });
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Workouts</Text>
          <TouchableOpacity onPress={() => openNewWorkout()}>
            <Feather name="plus-circle" size={28} color={colors.purple} />
          </TouchableOpacity>
        </View>

        {Object.keys(grouped).length === 0 ? (
          <GlowCard glowColor={colors.purple}>
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>
              No workouts yet. Tap the + above to create your first one.
            </Text>
          </GlowCard>
        ) : (
          Object.entries(grouped).map(([group, wkts]) => (
            <View key={group} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={[styles.groupTitle, { color: colors.cyan }]}>{group}</Text>
                <TouchableOpacity
                  onPress={() => openNewWorkout(group)}
                  style={[styles.groupAddBtn, { borderColor: colors.cyan + "60" }]}
                >
                  <Feather name="plus" size={14} color={colors.cyan} />
                  <Text style={[styles.groupAddText, { color: colors.cyan }]}>Add Day</Text>
                </TouchableOpacity>
              </View>
              {wkts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => router.push({ pathname: "/workout/[id]", params: { id: w.id } })}
                  activeOpacity={0.8}
                >
                  <GlowCard glowColor={colors.purple}>
                    <View style={styles.workoutHeader}>
                      <Text style={[styles.workoutName, { color: colors.foreground }]}>{w.name}</Text>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({ pathname: "/active-workout", params: { workoutId: w.id } });
                        }}
                        style={[styles.goButton, { backgroundColor: colors.lime }]}
                      >
                        <Feather name="play" size={16} color="#0a0a0a" />
                        <Text style={styles.goText}>GO</Text>
                      </TouchableOpacity>
                    </View>
                    {w.lastCompleted && (
                      <Text style={[styles.lastDone, { color: colors.mutedForeground }]}>
                        Last: {w.lastCompleted}
                      </Text>
                    )}
                    <Text style={[styles.summary, { color: colors.mutedForeground }]}>
                      {w.exercises.length} exercises
                      {w.exercises.length > 0 &&
                        ` \u00B7 ${w.exercises.reduce((sum, e) => sum + e.sets, 0)} sets`}
                    </Text>
                    <View style={styles.exercisePreview}>
                      {w.exercises.slice(0, 3).map((ex, idx) => (
                        <Text key={idx} style={[styles.exName, { color: colors.mutedForeground }]}>
                          {getExerciseName(ex.exerciseId)}
                          {idx < Math.min(2, w.exercises.length - 1) ? ", " : ""}
                        </Text>
                      ))}
                      {w.exercises.length > 3 && (
                        <Text style={[styles.exName, { color: colors.purple }]}>
                          {" "}+{w.exercises.length - 3} more
                        </Text>
                      )}
                    </View>
                    <View style={styles.editHint}>
                      <Feather name="edit-2" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.editHintText, { color: colors.mutedForeground }]}>
                        Tap to edit
                      </Text>
                    </View>
                  </GlowCard>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

        <View style={{ height: Platform.OS === "web" ? 34 + 84 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  group: { marginBottom: 8 },
  groupHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  groupAddBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  groupAddText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  workoutHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  workoutName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  goButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  goText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#0a0a0a",
  },
  lastDone: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  summary: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  exercisePreview: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    marginTop: 6,
  },
  exName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  editHint: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 8,
    opacity: 0.6,
  },
  editHintText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  empty: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" as const, paddingVertical: 12 },
});
