import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Switch, TextInput,
  TouchableOpacity, Platform, Modal, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateSettings, resetData } = useApp();

  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(profile.weightUnit);
  const [restTimer, setRestTimer] = useState(profile.restTimerDuration.toString());
  const [restSound, setRestSound] = useState(profile.restTimerSound);
  const [defaultSets, setDefaultSets] = useState(profile.defaultSets.toString());
  const [defaultReps, setDefaultReps] = useState(profile.defaultReps.toString());
  const [rpeEnabled, setRpeEnabled] = useState(profile.rpeEnabled);
  const [showCalc, setShowCalc] = useState<"1rm" | "plate" | null>(null);
  const [calcWeight, setCalcWeight] = useState("");
  const [calcReps, setCalcReps] = useState("");
  const [barWeight, setBarWeight] = useState("20");
  const [targetWeight, setTargetWeight] = useState("");

  const handleSave = () => {
    updateSettings({
      weightUnit,
      restTimerDuration: parseInt(restTimer) || 90,
      restTimerSound: restSound,
      defaultSets: parseInt(defaultSets) || 3,
      defaultReps: parseInt(defaultReps) || 10,
      rpeEnabled,
    });
    router.back();
  };

  const handleReset = () => {
    const doReset = () => {
      resetData();
      router.back();
    };
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Reset all data?\n\nThis will erase all workouts, logs, achievements, body weight history, and reset your XP, level, and streak. Your settings (units, rest timer, etc.) will be kept.\n\nThis cannot be undone.")) {
        doReset();
      }
    } else {
      Alert.alert(
        "Reset all data?",
        "This will erase all workouts, logs, achievements, body weight history, and reset your XP, level, and streak. Your settings (units, rest timer, etc.) will be kept.\n\nThis cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: doReset },
        ],
      );
    }
  };

  const calc1RM = () => {
    const w = parseFloat(calcWeight);
    const r = parseFloat(calcReps);
    if (!isNaN(w) && !isNaN(r) && r > 0) {
      return Math.round(w * (1 + r / 30));
    }
    return 0;
  };

  const calcPlates = () => {
    const target = parseFloat(targetWeight);
    const bar = parseFloat(barWeight);
    if (isNaN(target) || isNaN(bar) || target <= bar) return [];
    const perSide = (target - bar) / 2;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result: { plate: number; count: number }[] = [];
    let remaining = perSide;
    for (const plate of plates) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        result.push({ plate, count });
        remaining -= count * plate;
      }
    }
    return result;
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <GlowCard glowColor={colors.purple}>
          <Text style={[styles.sectionTitle, { color: colors.purple }]}>Rest Timer</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Duration (seconds)</Text>
            <TextInput
              style={[styles.settingInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              value={restTimer}
              onChangeText={setRestTimer}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Sound</Text>
            <Switch
              value={restSound}
              onValueChange={setRestSound}
              trackColor={{ false: colors.secondary, true: colors.purple }}
              thumbColor="#fff"
            />
          </View>
        </GlowCard>

        <GlowCard glowColor={colors.cyan}>
          <Text style={[styles.sectionTitle, { color: colors.cyan }]}>Defaults</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Sets</Text>
            <TextInput
              style={[styles.settingInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              value={defaultSets}
              onChangeText={setDefaultSets}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Reps</Text>
            <TextInput
              style={[styles.settingInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              value={defaultReps}
              onChangeText={setDefaultReps}
              keyboardType="number-pad"
            />
          </View>
        </GlowCard>

        <GlowCard glowColor={colors.lime}>
          <Text style={[styles.sectionTitle, { color: colors.lime }]}>Units & Tracking</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Weight Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
                style={[styles.unitBtn, { backgroundColor: weightUnit === "kg" ? colors.lime : colors.secondary }]}
              >
                <Text style={[styles.unitText, { color: weightUnit === "kg" ? "#0a0a0a" : colors.mutedForeground }]}>KG</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
                style={[styles.unitBtn, { backgroundColor: weightUnit === "lbs" ? colors.lime : colors.secondary }]}
              >
                <Text style={[styles.unitText, { color: weightUnit === "lbs" ? "#0a0a0a" : colors.mutedForeground }]}>LBS</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>RPE Tracking</Text>
            <Switch
              value={rpeEnabled}
              onValueChange={setRpeEnabled}
              trackColor={{ false: colors.secondary, true: colors.lime }}
              thumbColor="#fff"
            />
          </View>
        </GlowCard>

        <GlowCard glowColor={colors.pink}>
          <Text style={[styles.sectionTitle, { color: colors.pink }]}>Tools</Text>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setShowCalc("1rm")}
          >
            <Feather name="target" size={18} color={colors.pink} />
            <Text style={[styles.toolText, { color: colors.foreground }]}>1RM Calculator</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setShowCalc("plate")}
          >
            <Feather name="disc" size={18} color={colors.pink} />
            <Text style={[styles.toolText, { color: colors.foreground }]}>Plate Calculator</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </GlowCard>

        <NeonButton title="Save Settings" onPress={handleSave} color={colors.purple} style={{ marginTop: 8 }} />

        {/* ── Import Data ── */}
        <GlowCard glowColor={colors.cyan} style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.cyan }]}>Import Data</Text>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.input }]}
            onPress={() => router.push("/import-data")}
          >
            <Feather name="upload" size={18} color={colors.cyan} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.toolText, { color: colors.foreground }]}>Import Workout History</Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                Import logs from FitNotes (.realm backup)
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: colors.input }]}
            onPress={() => router.push("/import-data")}
          >
            <Feather name="file-text" size={18} color={colors.purple} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.toolText, { color: colors.foreground }]}>Import Workout Plan</Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                Convert any PDF program into routines
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </GlowCard>

        <GlowCard glowColor={colors.pink} style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.pink }]}>Danger Zone</Text>
          <Text style={[styles.dangerHint, { color: colors.mutedForeground }]}>
            Wipe all sample data and start with a clean slate. Settings will be kept.
          </Text>
          <TouchableOpacity
            style={[styles.dangerBtn, { borderColor: colors.pink }]}
            onPress={handleReset}
          >
            <Feather name="trash-2" size={16} color={colors.pink} />
            <Text style={[styles.dangerBtnText, { color: colors.pink }]}>Reset All Data</Text>
          </TouchableOpacity>
        </GlowCard>

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal visible={showCalc === "1rm"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>1RM Calculator</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Weight"
              placeholderTextColor={colors.mutedForeground}
              value={calcWeight}
              onChangeText={setCalcWeight}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Reps"
              placeholderTextColor={colors.mutedForeground}
              value={calcReps}
              onChangeText={setCalcReps}
              keyboardType="number-pad"
            />
            {calc1RM() > 0 && (
              <Text style={[styles.calcResult, { color: colors.pink }]}>
                Estimated 1RM: {calc1RM()} {weightUnit}
              </Text>
            )}
            <NeonButton title="Close" onPress={() => setShowCalc(null)} color={colors.secondary} small />
          </View>
        </View>
      </Modal>

      <Modal visible={showCalc === "plate"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Plate Calculator</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder={`Bar weight (${weightUnit})`}
              placeholderTextColor={colors.mutedForeground}
              value={barWeight}
              onChangeText={setBarWeight}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
              placeholder={`Target weight (${weightUnit})`}
              placeholderTextColor={colors.mutedForeground}
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="decimal-pad"
            />
            {calcPlates().length > 0 && (
              <View style={styles.plateResult}>
                <Text style={[styles.plateTitle, { color: colors.pink }]}>Per side:</Text>
                {calcPlates().map((p) => (
                  <Text key={p.plate} style={[styles.plateRow, { color: colors.foreground }]}>
                    {p.count} x {p.plate} {weightUnit}
                  </Text>
                ))}
              </View>
            )}
            <NeonButton title="Close" onPress={() => setShowCalc(null)} color={colors.secondary} small />
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
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 24,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  settingRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  settingLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  settingInput: {
    width: 70,
    height: 36,
    borderRadius: 8,
    textAlign: "center" as const,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    borderWidth: 1,
  },
  unitToggle: { flexDirection: "row" as const, gap: 4 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  unitText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  toolBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  toolText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center" as const, padding: 24 },
  modalContent: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 16 },
  input: { height: 48, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 12, borderWidth: 1 },
  calcResult: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 16, textAlign: "center" as const },
  plateResult: { marginBottom: 16 },
  plateTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  plateRow: { fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 4 },
  dangerHint: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12, lineHeight: 18 },
  dangerBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  dangerBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
