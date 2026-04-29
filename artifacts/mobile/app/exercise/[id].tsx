import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import { ExerciseDemo } from "@/components/ExerciseDemo";

const categoryColors: Record<string, string> = {
  Chest: "#f43f5e",
  Back: "#06b6d4",
  Legs: "#84cc16",
  Shoulders: "#a855f7",
  Arms: "#f97316",
  Core: "#eab308",
  Cardio: "#ec4899",
};

export default function ExerciseDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercises } = useApp();

  const exercise = exercises.find((e) => e.id === id);
  const accent = exercise ? (categoryColors[exercise.category] || colors.purple) : colors.purple;

  const topPadding = Platform.OS === "web" ? 16 : insets.top;

  if (!exercise) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Exercise not found</Text>
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
          {exercise.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{exercise.name}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.tag, { backgroundColor: accent + "20" }]}>
            <Text style={[styles.tagText, { color: accent }]}>{exercise.category}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{exercise.equipment}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
              {exercise.focus === "reps_weight" ? "Reps + Weight" : exercise.focus === "time" ? "Time" : "Distance"}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.cyan }]}>HOW IT LOOKS</Text>
        <ExerciseDemo pattern={exercise.movementPattern} color={accent} />

        {exercise.description && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.cyan }]}>OVERVIEW</Text>
            <Text style={[styles.description, { color: colors.foreground }]}>
              {exercise.description}
            </Text>
          </View>
        )}

        {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.cyan }]}>MUSCLES</Text>
            <GlowCard glowColor={accent}>
              <Text style={[styles.muscleLabel, { color: colors.mutedForeground }]}>PRIMARY</Text>
              <View style={styles.muscleRow}>
                {exercise.primaryMuscles.map((m) => (
                  <View key={m} style={[styles.muscleTag, { backgroundColor: accent + "30" }]}>
                    <Text style={[styles.muscleText, { color: accent }]}>{m}</Text>
                  </View>
                ))}
              </View>
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <>
                  <Text style={[styles.muscleLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
                    SECONDARY
                  </Text>
                  <View style={styles.muscleRow}>
                    {exercise.secondaryMuscles.map((m) => (
                      <View key={m} style={[styles.muscleTag, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.muscleText, { color: colors.mutedForeground }]}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </GlowCard>
          </View>
        )}

        {exercise.instructions && exercise.instructions.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.cyan }]}>HOW TO DO IT</Text>
            <GlowCard glowColor={colors.lime}>
              {exercise.instructions.map((step, i) => (
                <View key={i} style={styles.step}>
                  <View style={[styles.stepNum, { backgroundColor: colors.lime }]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
            </GlowCard>
          </View>
        )}

        {exercise.tips && exercise.tips.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.cyan }]}>TIPS</Text>
            <GlowCard glowColor={colors.pink}>
              {exercise.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Feather name="zap" size={16} color={colors.pink} style={{ marginTop: 2 }} />
                  <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
                </View>
              ))}
            </GlowCard>
          </View>
        )}

        <NeonButton
          title="Done"
          onPress={() => router.back()}
          color={colors.purple}
          style={{ marginTop: 24 }}
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
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 12 },
  metaRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 6, marginBottom: 20 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 10 },
  description: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  muscleLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 8 },
  muscleRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 6 },
  muscleTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  muscleText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  step: { flexDirection: "row" as const, gap: 12, marginBottom: 12, alignItems: "flex-start" as const },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center" as const, justifyContent: "center" as const,
    flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#0a0a0a" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  tipRow: { flexDirection: "row" as const, gap: 10, marginBottom: 10, alignItems: "flex-start" as const },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
