import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";

function SimpleBar({ value, maxValue, color, label }: { value: number; maxValue: number; color: string; label: string }) {
  const colors = useColors();
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={barStyles.container}>
      <Text style={[barStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[barStyles.track, { backgroundColor: colors.secondary }]}>
        <View style={[barStyles.fill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[barStyles.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: "row" as const, alignItems: "center" as const, marginBottom: 8, gap: 8 },
  label: { width: 36, fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" as const },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: "hidden" as const },
  fill: { height: "100%" as any, borderRadius: 6 },
  value: { width: 30, fontSize: 12, fontFamily: "Inter_500Medium" },
});

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logs, exercises, profile, addBodyWeight } = useApp();
  const [weightInput, setWeightInput] = useState("");

  const weeklyVolume = useMemo(() => {
    const weeks: Record<string, number> = {};
    logs.forEach((log) => {
      const d = new Date(log.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      let vol = 0;
      log.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.completed) vol += s.reps * s.weight;
        });
      });
      weeks[key] = (weeks[key] || 0) + vol;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([week, vol]) => ({ week: week.slice(5), volume: vol }));
  }, [logs]);

  const weeklyFrequency = useMemo(() => {
    const weeks: Record<string, number> = {};
    logs.forEach((log) => {
      const d = new Date(log.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([week, count]) => ({ week: week.slice(5), count }));
  }, [logs]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      log.exercises.forEach((ex) => {
        const exercise = exercises.find((e) => e.id === ex.exerciseId);
        if (exercise) {
          counts[exercise.category] = (counts[exercise.category] || 0) + ex.sets.length;
        }
      });
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [logs, exercises]);

  const totalCategorySets = categoryBreakdown.reduce((sum, [, c]) => sum + c, 0);

  const categoryColors: Record<string, string> = {
    Chest: "#f43f5e", Back: "#06b6d4", Legs: "#84cc16",
    Shoulders: "#a855f7", Arms: "#f97316", Core: "#eab308", Cardio: "#ec4899",
  };

  const personalRecords = useMemo(() => {
    const prs: { exercise: string; weight: number }[] = [];
    Object.entries(profile.personalRecords).forEach(([exId, weight]) => {
      const ex = exercises.find((e) => e.id === exId);
      if (ex) prs.push({ exercise: ex.name, weight });
    });
    return prs;
  }, [profile.personalRecords, exercises]);

  const maxVolume = Math.max(...weeklyVolume.map((w) => w.volume), 1);
  const maxFreq = Math.max(...weeklyFrequency.map((w) => w.count), 1);

  const handleAddWeight = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0) {
      addBodyWeight(w);
      setWeightInput("");
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Stats</Text>

        <GlowCard glowColor={colors.purple}>
          <Text style={[styles.cardTitle, { color: colors.purple }]}>Training Volume</Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>Weekly total (sets x reps x weight)</Text>
          {weeklyVolume.map((w) => (
            <SimpleBar key={w.week} value={w.volume} maxValue={maxVolume} color={colors.purple} label={w.week} />
          ))}
        </GlowCard>

        <GlowCard glowColor={colors.cyan}>
          <Text style={[styles.cardTitle, { color: colors.cyan }]}>Workout Frequency</Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>Sessions per week</Text>
          {weeklyFrequency.map((w) => (
            <SimpleBar key={w.week} value={w.count} maxValue={maxFreq} color={colors.cyan} label={w.week} />
          ))}
        </GlowCard>

        <GlowCard glowColor={colors.lime}>
          <Text style={[styles.cardTitle, { color: colors.lime }]}>Muscle Groups</Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>Sets by category</Text>
          {categoryBreakdown.map(([cat, count]) => {
            const pct = totalCategorySets > 0 ? Math.round((count / totalCategorySets) * 100) : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: categoryColors[cat] || colors.purple }]} />
                <Text style={[styles.catName, { color: colors.foreground }]}>{cat}</Text>
                <View style={[styles.catBarTrack, { backgroundColor: colors.secondary }]}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${pct}%` as any, backgroundColor: categoryColors[cat] || colors.purple },
                    ]}
                  />
                </View>
                <Text style={[styles.catPct, { color: colors.mutedForeground }]}>{pct}%</Text>
              </View>
            );
          })}
        </GlowCard>

        <GlowCard glowColor={colors.pink}>
          <Text style={[styles.cardTitle, { color: colors.pink }]}>Personal Records</Text>
          {personalRecords.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No PRs yet</Text>
          ) : (
            personalRecords.map((pr) => (
              <View key={pr.exercise} style={styles.prRow}>
                <Feather name="award" size={16} color={colors.pink} />
                <Text style={[styles.prName, { color: colors.foreground }]}>{pr.exercise}</Text>
                <Text style={[styles.prWeight, { color: colors.pink }]}>
                  {pr.weight} {profile.weightUnit}
                </Text>
              </View>
            ))
          )}
        </GlowCard>

        <GlowCard glowColor={colors.cyan}>
          <Text style={[styles.cardTitle, { color: colors.cyan }]}>Body Weight</Text>
          <View style={styles.weightInputRow}>
            <TextInput
              style={[styles.weightInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder={`Weight (${profile.weightUnit})`}
              placeholderTextColor={colors.mutedForeground}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
            />
            <NeonButton title="Log" onPress={handleAddWeight} color={colors.cyan} small />
          </View>
          {profile.bodyWeight.slice(-7).map((bw) => (
            <View key={bw.date} style={styles.bwRow}>
              <Text style={[styles.bwDate, { color: colors.mutedForeground }]}>{bw.date.slice(5)}</Text>
              <Text style={[styles.bwWeight, { color: colors.foreground }]}>
                {bw.weight} {profile.weightUnit}
              </Text>
            </View>
          ))}
        </GlowCard>

        <View style={{ height: Platform.OS === "web" ? 34 + 84 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 20 },
  cardTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  catRow: { flexDirection: "row" as const, alignItems: "center" as const, marginBottom: 8, gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { width: 80, fontSize: 13, fontFamily: "Inter_500Medium" },
  catBarTrack: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden" as const },
  catBarFill: { height: "100%" as any, borderRadius: 5 },
  catPct: { width: 36, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" as const },
  prRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, paddingVertical: 6 },
  prName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  prWeight: { fontSize: 16, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  weightInputRow: { flexDirection: "row" as const, gap: 8, marginBottom: 12 },
  weightInput: { flex: 1, height: 40, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, fontFamily: "Inter_400Regular", borderWidth: 1 },
  bwRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, paddingVertical: 4 },
  bwDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  bwWeight: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
