import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import type { LoggedExercise } from "@/store/types";

export default function LogDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logs, exercises, profile, updateLog, deleteLog } = useApp();

  const log = logs.find((l) => l.id === id);

  const [editing, setEditing] = useState(false);
  const [duration, setDuration] = useState("0");
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);

  useEffect(() => {
    if (log) {
      setDuration(log.duration.toString());
      setLoggedExercises(log.exercises);
    }
  }, [log]);

  const getExName = (exId: string) => exercises.find((e) => e.id === exId)?.name || "Unknown";

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight", value: string) => {
    setLoggedExercises((prev) => {
      const next = [...prev];
      const sets = [...next[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: parseFloat(value) || 0 };
      next[exIdx] = { ...next[exIdx], sets };
      return next;
    });
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    setLoggedExercises((prev) => {
      const next = [...prev];
      const sets = [...next[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], completed: !sets[setIdx].completed };
      next[exIdx] = { ...next[exIdx], sets };
      return next;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setLoggedExercises((prev) => {
      const next = [...prev];
      const sets = next[exIdx].sets.filter((_, i) => i !== setIdx);
      next[exIdx] = { ...next[exIdx], sets };
      return next;
    });
  };

  const addSet = (exIdx: number) => {
    setLoggedExercises((prev) => {
      const next = [...prev];
      const sets = next[exIdx].sets;
      const last = sets[sets.length - 1] || { reps: profile.defaultReps, weight: 0, completed: true };
      next[exIdx] = { ...next[exIdx], sets: [...sets, { ...last, completed: true }] };
      return next;
    });
  };

  const removeExercise = (exIdx: number) => {
    setLoggedExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const save = () => {
    if (!log) return;
    updateLog({
      ...log,
      duration: parseFloat(duration) || 0,
      exercises: loggedExercises,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!log) return;
    Alert.alert(
      "Delete log?",
      "This will permanently remove this workout from your history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: () => {
            deleteLog(log.id);
            router.back();
          },
        },
      ]
    );
  };

  const calcVolume = () => {
    let vol = 0;
    loggedExercises.forEach((ex) => {
      ex.sets.forEach((s) => { if (s.completed) vol += s.reps * s.weight; });
    });
    return vol;
  };

  const totalSets = loggedExercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0
  );

  const topPadding = Platform.OS === "web" ? 16 : insets.top;

  if (!log) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: colors.foreground, padding: 20 }]}>Log not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPadding + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.foreground }]} numberOfLines={1}>
          {log.workoutName}
        </Text>
        {editing ? (
          <TouchableOpacity onPress={save}>
            <Feather name="check" size={24} color={colors.lime} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Feather name="edit-2" size={20} color={colors.cyan} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{log.workoutName}</Text>
        <Text style={[styles.date, { color: colors.cyan }]}>{log.date}</Text>

        <View style={styles.statsRow}>
          <GlowCard glowColor={colors.cyan} style={styles.statCard}>
            <Feather name="clock" size={18} color={colors.cyan} />
            {editing ? (
              <TextInput
                style={[styles.statValueInput, { color: colors.foreground, borderBottomColor: colors.cyan }]}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
              />
            ) : (
              <Text style={[styles.statValue, { color: colors.foreground }]}>{log.duration}</Text>
            )}
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>min</Text>
          </GlowCard>
          <GlowCard glowColor={colors.lime} style={styles.statCard}>
            <Feather name="activity" size={18} color={colors.lime} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{totalSets}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>sets</Text>
          </GlowCard>
          <GlowCard glowColor={colors.pink} style={styles.statCard}>
            <Feather name="bar-chart-2" size={18} color={colors.pink} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{calcVolume().toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>vol</Text>
          </GlowCard>
        </View>

        {loggedExercises.length === 0 ? (
          <GlowCard glowColor={colors.purple}>
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>
              No exercises logged for this workout.
            </Text>
          </GlowCard>
        ) : (
          loggedExercises.map((ex, exIdx) => (
            <GlowCard key={`${ex.exerciseId}-${exIdx}`} glowColor={colors.purple}>
              <View style={styles.exHeader}>
                <Text style={[styles.exName, { color: colors.foreground }]}>
                  {getExName(ex.exerciseId)}
                </Text>
                {editing && (
                  <TouchableOpacity onPress={() => removeExercise(exIdx)}>
                    <Feather name="trash-2" size={18} color={colors.pink} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.setHeader}>
                <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>SET</Text>
                <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>REPS</Text>
                <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>{profile.weightUnit.toUpperCase()}</Text>
                <Text style={[styles.setLabel, { color: colors.mutedForeground, width: 40 }]} />
              </View>
              {ex.sets.map((set, setIdx) => (
                <View key={setIdx} style={styles.setRow}>
                  <Text style={[styles.setNum, { color: colors.mutedForeground }]}>{setIdx + 1}</Text>
                  {editing ? (
                    <TextInput
                      style={[styles.setInput, {
                        backgroundColor: colors.input, color: colors.foreground,
                        borderColor: set.completed ? colors.lime + "50" : colors.border,
                      }]}
                      value={set.reps.toString()}
                      onChangeText={(v) => updateSet(exIdx, setIdx, "reps", v)}
                      keyboardType="number-pad"
                    />
                  ) : (
                    <View style={[styles.setReadOnly, {
                      backgroundColor: colors.input,
                      borderColor: set.completed ? colors.lime + "50" : colors.border,
                    }]}>
                      <Text style={[styles.setReadText, { color: colors.foreground }]}>{set.reps}</Text>
                    </View>
                  )}
                  {editing ? (
                    <TextInput
                      style={[styles.setInput, {
                        backgroundColor: colors.input, color: colors.foreground,
                        borderColor: set.completed ? colors.lime + "50" : colors.border,
                      }]}
                      value={set.weight.toString()}
                      onChangeText={(v) => updateSet(exIdx, setIdx, "weight", v)}
                      keyboardType="decimal-pad"
                    />
                  ) : (
                    <View style={[styles.setReadOnly, {
                      backgroundColor: colors.input,
                      borderColor: set.completed ? colors.lime + "50" : colors.border,
                    }]}>
                      <Text style={[styles.setReadText, { color: colors.foreground }]}>{set.weight}</Text>
                    </View>
                  )}
                  {editing ? (
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      <TouchableOpacity
                        onPress={() => toggleSet(exIdx, setIdx)}
                        style={[styles.checkBtn, { backgroundColor: set.completed ? colors.lime : colors.secondary }]}
                      >
                        <Feather name="check" size={14} color={set.completed ? "#0a0a0a" : colors.mutedForeground} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeSet(exIdx, setIdx)}
                        style={[styles.checkBtn, { backgroundColor: colors.secondary }]}
                      >
                        <Feather name="x" size={14} color={colors.pink} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.checkBtn, { backgroundColor: set.completed ? colors.lime : colors.secondary }]}>
                      <Feather name="check" size={14} color={set.completed ? "#0a0a0a" : colors.mutedForeground} />
                    </View>
                  )}
                </View>
              ))}
              {editing && (
                <TouchableOpacity
                  onPress={() => addSet(exIdx)}
                  style={[styles.addSetBtn, { borderColor: colors.purple }]}
                >
                  <Feather name="plus" size={14} color={colors.purple} />
                  <Text style={[styles.addSetText, { color: colors.purple }]}>Add Set</Text>
                </TouchableOpacity>
              )}
            </GlowCard>
          ))
        )}

        {editing ? (
          <NeonButton
            title="Save Changes"
            onPress={save}
            color={colors.lime}
            textStyle={{ color: "#0a0a0a" }}
            style={{ marginTop: 16 }}
          />
        ) : (
          <NeonButton
            title="Edit Log"
            onPress={() => setEditing(true)}
            color={colors.cyan}
            style={{ marginTop: 16 }}
          />
        )}

        <NeonButton
          title="Delete Log"
          onPress={handleDelete}
          color={colors.pink}
          style={{ marginTop: 12 }}
        />

        <View style={{ height: 60 }} />
      </ScrollView>
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
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  date: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 16 },
  statsRow: { flexDirection: "row" as const, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center" as const, paddingVertical: 12 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 4 },
  statValueInput: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
    textAlign: "center" as const,
    minWidth: 50,
    borderBottomWidth: 1,
  },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  empty: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" as const, paddingVertical: 12 },
  exHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  exName: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1 },
  setHeader: {
    flexDirection: "row" as const,
    marginBottom: 6,
    paddingHorizontal: 4,
    gap: 8,
  },
  setLabel: { flex: 1, fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textAlign: "center" as const },
  setRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 6 },
  setNum: { width: 24, fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center" as const },
  setInput: { flex: 1, height: 40, borderRadius: 8, textAlign: "center" as const, fontSize: 15, fontFamily: "Inter_500Medium", borderWidth: 1 },
  setReadOnly: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
  },
  setReadText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  addSetBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 8,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    gap: 6,
  },
  addSetText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
