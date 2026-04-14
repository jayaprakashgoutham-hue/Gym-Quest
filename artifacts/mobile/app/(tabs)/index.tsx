import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  TextInput, Modal, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import { useRouter } from "expo-router";

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { workouts, exercises, addWorkout } = useApp();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("");

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

  const handleCreateWorkout = () => {
    if (!newName.trim()) return;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    addWorkout({
      id,
      name: newName.trim(),
      groupName: newGroup.trim() || "Custom",
      exercises: [],
    });
    setNewName("");
    setNewGroup("");
    setShowAdd(false);
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
          <TouchableOpacity onPress={() => setShowAdd(true)}>
            <Feather name="plus-circle" size={28} color={colors.purple} />
          </TouchableOpacity>
        </View>

        {Object.entries(grouped).map(([group, wkts]) => (
          <View key={group} style={styles.group}>
            <Text style={[styles.groupTitle, { color: colors.cyan }]}>{group}</Text>
            {wkts.map((w) => (
              <GlowCard key={w.id} glowColor={colors.purple}>
                <View style={styles.workoutHeader}>
                  <Text style={[styles.workoutName, { color: colors.foreground }]}>{w.name}</Text>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/active-workout", params: { workoutId: w.id } })}
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
              </GlowCard>
            ))}
          </View>
        ))}

        <View style={{ height: Platform.OS === "web" ? 34 + 84 : 100 }} />
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Workout</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Workout name"
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Group name (e.g. Push Pull Legs)"
              placeholderTextColor={colors.mutedForeground}
              value={newGroup}
              onChangeText={setNewGroup}
            />
            <View style={styles.modalButtons}>
              <NeonButton title="Cancel" onPress={() => setShowAdd(false)} color={colors.secondary} small />
              <NeonButton title="Create" onPress={handleCreateWorkout} color={colors.purple} small />
            </View>
          </View>
        </View>
      </Modal>
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
  groupTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center" as const,
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    gap: 12,
    marginTop: 8,
  },
});
