import React, { useState, useMemo, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, Modal, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import { SwipeableCard } from "@/components/SwipeableCard";
import type { Workout, WorkoutExercise } from "@/store/types";

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

const categoryColors: Record<string, string> = {
  Chest: "#f43f5e",
  Back: "#06b6d4",
  Legs: "#84cc16",
  Shoulders: "#a855f7",
  Arms: "#f97316",
  Core: "#eab308",
  Cardio: "#ec4899",
};

export default function WorkoutEditorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, group: groupParam, isNew: isNewParam } = useLocalSearchParams<{
    id: string; group?: string; isNew?: string;
  }>();
  const isCreating = isNewParam === "1";
  const { workouts, exercises, updateWorkout, deleteWorkout, addWorkout, profile } = useApp();

  const existingWorkout = workouts.find((w) => w.id === id);

  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("All");

  useEffect(() => {
    if (existingWorkout) {
      setName(existingWorkout.name);
      setGroupName(existingWorkout.groupName);
      setWorkoutExercises(existingWorkout.exercises);
    } else if (isCreating) {
      setName("");
      setGroupName(groupParam || "Custom");
      setWorkoutExercises([]);
    }
  }, [existingWorkout, isCreating, groupParam]);

  const getExName = (exId: string) => exercises.find((e) => e.id === exId)?.name || "Unknown";
  const getExCategory = (exId: string) => exercises.find((e) => e.id === exId)?.category || "";

  const filteredExercises = useMemo(() => {
    return exercises.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = pickerCategory === "All" || e.category === pickerCategory;
      return matchesSearch && matchesCat;
    });
  }, [exercises, search, pickerCategory]);

  const addExerciseToWorkout = (exerciseId: string) => {
    setWorkoutExercises((prev) => [
      ...prev,
      { exerciseId, sets: profile.defaultSets, reps: profile.defaultReps, weight: 0 },
    ]);
    setShowPicker(false);
    setSearch("");
  };

  const updateField = (idx: number, field: "sets" | "reps" | "weight", value: string) => {
    setWorkoutExercises((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: parseFloat(value) || 0 };
      return next;
    });
  };

  const removeExercise = (idx: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveExercise = (idx: number, direction: -1 | 1) => {
    setWorkoutExercises((prev) => {
      const next = [...prev];
      const target = idx + direction;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const save = () => {
    const trimmedName = name.trim();
    const trimmedGroup = groupName.trim() || "Custom";
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter a workout name.");
      return;
    }
    if (isCreating) {
      const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const workout: Workout = {
        id: newId,
        name: trimmedName,
        groupName: trimmedGroup,
        exercises: workoutExercises,
      };
      addWorkout(workout);
    } else if (existingWorkout) {
      updateWorkout({
        ...existingWorkout,
        name: trimmedName,
        groupName: trimmedGroup,
        exercises: workoutExercises,
      });
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existingWorkout) return;
    Alert.alert(
      "Delete workout?",
      `This will permanently remove "${existingWorkout.name}". Past logs are kept.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: () => {
            deleteWorkout(existingWorkout.id);
            router.back();
          },
        },
      ]
    );
  };

  const topPadding = Platform.OS === "web" ? 16 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPadding + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.foreground }]} numberOfLines={1}>
          {isCreating ? "New Workout" : "Edit Workout"}
        </Text>
        <TouchableOpacity onPress={save}>
          <Feather name="check" size={24} color={colors.lime} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.mutedForeground }]}>WORKOUT NAME</Text>
        <TextInput
          style={[styles.input, {
            backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border,
          }]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Chest Day"
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 16 }]}>GROUP</Text>
        <TextInput
          style={[styles.input, {
            backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border,
          }]}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="e.g. Push Pull Legs"
          placeholderTextColor={colors.mutedForeground}
        />

        <View style={styles.exercisesHeader}>
          <Text style={[styles.label, { color: colors.cyan }]}>EXERCISES ({workoutExercises.length})</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={[styles.addBtn, { backgroundColor: colors.purple }]}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {workoutExercises.length === 0 ? (
          <GlowCard glowColor={colors.purple}>
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>
              No exercises yet. Tap "Add" to pick from the library.
            </Text>
          </GlowCard>
        ) : (
          workoutExercises.map((ex, idx) => {
            const cat = getExCategory(ex.exerciseId);
            const accent = categoryColors[cat] || colors.purple;
            return (
              <SwipeableCard
                key={`${ex.exerciseId}-${idx}`}
                onDelete={() => removeExercise(idx)}
                deleteLabel="Remove"
                style={{ borderRadius: 16, borderWidth: 1, borderColor: accent + "30", marginBottom: 12 }}
              >
                <GlowCard glowColor={accent} style={{ marginBottom: 0 }}>
                  <View style={styles.exHeader}>
                    <Text style={[styles.exName, { color: colors.foreground }]} numberOfLines={1}>
                      {idx + 1}. {getExName(ex.exerciseId)}
                    </Text>
                    <View style={styles.exActions}>
                      <TouchableOpacity onPress={() => moveExercise(idx, -1)} disabled={idx === 0}>
                        <Feather name="chevron-up" size={20} color={idx === 0 ? colors.border : colors.mutedForeground} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => moveExercise(idx, 1)} disabled={idx === workoutExercises.length - 1}>
                        <Feather name="chevron-down" size={20} color={idx === workoutExercises.length - 1 ? colors.border : colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.fieldRow}>
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>SETS</Text>
                      <TextInput
                        style={[styles.smallInput, {
                          backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border,
                        }]}
                        value={ex.sets.toString()}
                        onChangeText={(v) => updateField(idx, "sets", v)}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>REPS</Text>
                      <TextInput
                        style={[styles.smallInput, {
                          backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border,
                        }]}
                        value={ex.reps.toString()}
                        onChangeText={(v) => updateField(idx, "reps", v)}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                        {profile.weightUnit.toUpperCase()}
                      </Text>
                      <TextInput
                        style={[styles.smallInput, {
                          backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border,
                        }]}
                        value={ex.weight.toString()}
                        onChangeText={(v) => updateField(idx, "weight", v)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <Text style={[styles.swipeHint, { color: colors.mutedForeground }]}>
                    ← swipe left to remove
                  </Text>
                </GlowCard>
              </SwipeableCard>
            );
          })
        )}

        <NeonButton
          title="Save Workout"
          onPress={save}
          color={colors.lime}
          textStyle={{ color: "#0a0a0a" }}
          style={{ marginTop: 16 }}
        />

        {!isCreating && existingWorkout && (
          <NeonButton
            title="Delete Workout"
            onPress={handleDelete}
            color={colors.pink}
            style={{ marginTop: 12 }}
          />
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={[styles.pickerSheet, { backgroundColor: colors.background, paddingTop: topPadding + 8 }]}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Add Exercise</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border, marginHorizontal: 20 }]}>
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setPickerCategory(cat)}
                style={[styles.filterChip, {
                  backgroundColor: pickerCategory === cat ? colors.purple : colors.secondary,
                }]}
              >
                <Text style={[styles.filterText, {
                  color: pickerCategory === cat ? "#fff" : colors.mutedForeground,
                }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {filteredExercises.map((ex) => {
              const accent = categoryColors[ex.category] || colors.purple;
              return (
                <TouchableOpacity key={ex.id} onPress={() => addExerciseToWorkout(ex.id)}>
                  <GlowCard glowColor={accent}>
                    <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
                    <View style={styles.metaTags}>
                      <View style={[styles.tag, { backgroundColor: accent + "20" }]}>
                        <Text style={[styles.tagText, { color: accent }]}>{ex.category}</Text>
                      </View>
                      <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{ex.equipment}</Text>
                      </View>
                    </View>
                  </GlowCard>
                </TouchableOpacity>
              );
            })}
            {filteredExercises.length === 0 && (
              <Text style={[styles.empty, { color: colors.mutedForeground, marginTop: 20, textAlign: "center" }]}>
                No exercises match your search.
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" as const, marginHorizontal: 8 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 8 },
  input: { height: 48, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular", borderWidth: 1 },
  exercisesHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 24,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  empty: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" as const, paddingVertical: 12 },
  swipeHint: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 8, opacity: 0.5 },
  exHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  exName: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  exActions: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  fieldRow: { flexDirection: "row" as const, gap: 10 },
  field: { flex: 1 },
  fieldLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  smallInput: { height: 40, borderRadius: 8, textAlign: "center" as const, fontSize: 15, fontFamily: "Inter_500Medium", borderWidth: 1 },
  pickerSheet: { flex: 1 },
  pickerHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  pickerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  filterRow: { marginBottom: 12, flexGrow: 0 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  metaTags: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 6, marginTop: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
