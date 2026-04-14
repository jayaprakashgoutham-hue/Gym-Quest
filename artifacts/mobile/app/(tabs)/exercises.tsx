import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Platform, Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import type { Exercise } from "@/store/types";

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];
const EQUIPMENT = ["All", "Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];

const categoryColors: Record<string, string> = {
  Chest: "#f43f5e",
  Back: "#06b6d4",
  Legs: "#84cc16",
  Shoulders: "#a855f7",
  Arms: "#f97316",
  Core: "#eab308",
  Cardio: "#ec4899",
};

export default function ExercisesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { exercises, addExercise } = useApp();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", category: "Chest", equipment: "Barbell", focus: "reps_weight" as const });

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
      const matchesEquipment = selectedEquipment === "All" || e.equipment === selectedEquipment;
      return matchesSearch && matchesCategory && matchesEquipment;
    });
  }, [exercises, search, selectedCategory, selectedEquipment]);

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    addExercise({ id, ...newExercise, name: newExercise.name.trim() });
    setNewExercise({ name: "", category: "Chest", equipment: "Barbell", focus: "reps_weight" });
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
          <Text style={[styles.title, { color: colors.foreground }]}>Exercises</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)}>
            <Feather name="plus-circle" size={28} color={colors.purple} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedCategory === cat ? colors.purple : colors.secondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedCategory === cat ? "#fff" : colors.mutedForeground },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {EQUIPMENT.map((eq) => (
            <TouchableOpacity
              key={eq}
              onPress={() => setSelectedEquipment(eq)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedEquipment === eq ? colors.cyan : colors.secondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedEquipment === eq ? "#fff" : colors.mutedForeground },
                ]}
              >
                {eq}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {filtered.length} exercises
        </Text>

        {filtered.map((exercise) => (
          <GlowCard key={exercise.id} glowColor={categoryColors[exercise.category] || colors.purple}>
            <Text style={[styles.exName, { color: colors.foreground }]}>{exercise.name}</Text>
            <View style={styles.exMeta}>
              <View style={[styles.tag, { backgroundColor: (categoryColors[exercise.category] || colors.purple) + "20" }]}>
                <Text style={[styles.tagText, { color: categoryColors[exercise.category] || colors.purple }]}>
                  {exercise.category}
                </Text>
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
          </GlowCard>
        ))}

        <View style={{ height: Platform.OS === "web" ? 34 + 84 : 100 }} />
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Exercise</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Exercise name"
              placeholderTextColor={colors.mutedForeground}
              value={newExercise.name}
              onChangeText={(t) => setNewExercise((p) => ({ ...p, name: t }))}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewExercise((p) => ({ ...p, category: cat }))}
                  style={[
                    styles.filterChip,
                    { backgroundColor: newExercise.category === cat ? colors.purple : colors.secondary },
                  ]}
                >
                  <Text style={[styles.filterText, { color: newExercise.category === cat ? "#fff" : colors.mutedForeground }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Equipment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {EQUIPMENT.filter((e) => e !== "All").map((eq) => (
                <TouchableOpacity
                  key={eq}
                  onPress={() => setNewExercise((p) => ({ ...p, equipment: eq }))}
                  style={[
                    styles.filterChip,
                    { backgroundColor: newExercise.equipment === eq ? colors.cyan : colors.secondary },
                  ]}
                >
                  <Text style={[styles.filterText, { color: newExercise.equipment === eq ? "#fff" : colors.mutedForeground }]}>
                    {eq}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <NeonButton title="Cancel" onPress={() => setShowAdd(false)} color={colors.secondary} small />
              <NeonButton title="Add" onPress={handleAddExercise} color={colors.purple} small />
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
    marginBottom: 16,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterRow: { marginBottom: 12, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  count: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  exName: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  exMeta: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center" as const, padding: 24 },
  modalContent: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 16 },
  input: { height: 48, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 12, borderWidth: 1 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 6 },
  modalButtons: { flexDirection: "row" as const, justifyContent: "flex-end" as const, gap: 12, marginTop: 8 },
});
