import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { NeonButton } from "@/components/NeonButton";
import type { WorkoutLog, Workout } from "@/store/types";

const WARN_COLOR = "#f0b429";

// Build the API base URL from the env var the mobile workflow injects
function getApiBase() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  if (!domain) return "/api";
  return `https://${domain}/api`;
}

type ImportType = "history" | "plan";
type Step = "pick" | "uploading" | "preview" | "done";

interface PdfWorkout extends Workout {
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
    name?: string;
  }>;
}

interface PdfResult {
  workouts: PdfWorkout[];
  warning?: string;
}

interface RealmLogEx extends WorkoutLog {
  exercises: Array<{
    exerciseId: string;
    sets: Array<{ reps: number; weight: number; completed: boolean }>;
    name?: string;
  }>;
}

interface RealmResult {
  logs: RealmLogEx[];
  method: string;
  programNames?: string[];
  dates?: string[];
  warning?: string;
}

export default function ImportDataScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { importLogs, importWorkouts } = useApp();

  const [importType, setImportType] = useState<ImportType | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);
  const [realmResult, setRealmResult] = useState<RealmResult | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handlePickFile = async (type: ImportType) => {
    setImportType(type);
    setError(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      await uploadFile(file.uri, file.name ?? "upload", type);
    } catch {
      setError("Could not open file picker. Please try again.");
    }
  };

  const uploadFile = async (uri: string, name: string, type: ImportType) => {
    setLoading(true);
    setStep("uploading");
    setError(null);

    try {
      const endpoint = type === "history" ? "/import/realm" : "/import/pdf";
      const uploadUrl = `${getApiBase()}${endpoint}`;

      // Read as base64, then POST as multipart/form-data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base64 = await (FileSystem.readAsStringAsync as any)(uri, { encoding: "base64" });

      const response = await uploadBase64AsMultipart(uploadUrl, base64, name);

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Upload failed" })) as { error?: string };
        throw new Error(body.error ?? `Server error ${response.status}`);
      }

      const data = await response.json() as PdfResult | RealmResult;

      if (type === "history") {
        setRealmResult(data as RealmResult);
      } else {
        setPdfResult(data as PdfResult);
      }
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Make sure the API server is running.");
      setStep("pick");
    } finally {
      setLoading(false);
    }
  };

  async function uploadBase64AsMultipart(url: string, base64: string, fileName: string): Promise<Response> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes]);
    const formData = new FormData();
    formData.append("file", blob as unknown as Blob, fileName);
    return fetch(url, { method: "POST", body: formData });
  }

  const handleConfirmPdf = () => {
    if (!pdfResult) return;
    const workoutsToImport: Workout[] = pdfResult.workouts.map((w) => ({
      id: w.id,
      name: w.name,
      groupName: w.groupName,
      exercises: w.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      })),
    }));
    importWorkouts(workoutsToImport);
    setStep("done");
  };

  const handleConfirmRealm = () => {
    if (!realmResult) return;
    const logsToImport: WorkoutLog[] = realmResult.logs.map((l) => ({
      id: l.id,
      workoutId: l.workoutId,
      workoutName: l.workoutName,
      date: l.date,
      duration: l.duration,
      exercises: l.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
      })),
    }));
    importLogs(logsToImport);
    setStep("done");
  };

  const handleReset = () => {
    setImportType(null);
    setStep("pick");
    setError(null);
    setPdfResult(null);
    setRealmResult(null);
  };

  // ── Screens ─────────────────────────────────────────────────────────────

  const renderPickScreen = () => (
    <View>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Import your existing data from other fitness apps or PDF programs.
      </Text>

      {error && (
        <View style={[styles.errorBox, { borderColor: "#ff4444" }]}>
          <Feather name="alert-circle" size={16} color="#ff4444" />
          <Text style={[styles.errorText, { color: "#ff4444" }]}>{error}</Text>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>IMPORT OPTIONS</Text>

      <TouchableOpacity onPress={() => handlePickFile("history")} disabled={loading}>
        <GlowCard glowColor={colors.purple} style={styles.importCard}>
          <View style={[styles.importIcon, { backgroundColor: colors.purple + "22" }]}>
            <Feather name="clock" size={24} color={colors.purple} />
          </View>
          <View style={styles.importCardText}>
            <Text style={[styles.importCardTitle, { color: colors.foreground }]}>
              Import Workout History
            </Text>
            <Text style={[styles.importCardDesc, { color: colors.mutedForeground }]}>
              Import past workout logs from FitNotes{"\n"}
              <Text style={{ color: colors.purple }}>Supports: .realm backup files</Text>
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </GlowCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePickFile("plan")} disabled={loading} style={{ marginTop: 12 }}>
        <GlowCard glowColor={colors.cyan} style={styles.importCard}>
          <View style={[styles.importIcon, { backgroundColor: colors.cyan + "22" }]}>
            <Feather name="file-text" size={24} color={colors.cyan} />
          </View>
          <View style={styles.importCardText}>
            <Text style={[styles.importCardTitle, { color: colors.foreground }]}>
              Import Workout Plan
            </Text>
            <Text style={[styles.importCardDesc, { color: colors.mutedForeground }]}>
              Convert a PDF program into ready-to-use{"\n"}routines (PPL, 5/3/1, Upper/Lower…){"\n"}
              <Text style={{ color: colors.cyan }}>Supports: any PDF workout program</Text>
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </GlowCard>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowTipModal(true)} style={styles.tipRow}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
          How to export your FitNotes backup
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderUploadingScreen = () => (
    <View style={styles.centeredContent}>
      <ActivityIndicator size="large" color={colors.purple} />
      <Text style={[styles.loadingTitle, { color: colors.foreground }]}>
        {importType === "history" ? "Reading workout history…" : "Analysing program…"}
      </Text>
      <Text style={[styles.loadingSubtitle, { color: colors.mutedForeground }]}>
        {importType === "history"
          ? "Extracting your logs from the backup file"
          : "Detecting workout days, exercises, and sets"}
      </Text>
    </View>
  );

  const renderPdfPreview = () => {
    if (!pdfResult) return null;
    const totalExercises = pdfResult.workouts.reduce((s, w) => s + w.exercises.length, 0);
    return (
      <View>
        {pdfResult.warning && (
          <View style={[styles.warningBox, { borderColor: WARN_COLOR }]}>
            <Feather name="alert-triangle" size={14} color={WARN_COLOR} />
            <Text style={[styles.warningText, { color: WARN_COLOR }]}>{pdfResult.warning}</Text>
          </View>
        )}

        <View style={styles.previewStats}>
          <View style={[styles.statBadge, { backgroundColor: colors.cyan + "22" }]}>
            <Text style={[styles.statNumber, { color: colors.cyan }]}>{pdfResult.workouts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Workout Days</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.purple + "22" }]}>
            <Text style={[styles.statNumber, { color: colors.purple }]}>{totalExercises}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Exercises</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>WORKOUT DAYS DETECTED</Text>
        {pdfResult.workouts.map((w, i) => (
          <GlowCard key={i} glowColor={colors.cyan} style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <Text style={[styles.previewCardTitle, { color: colors.foreground }]}>{w.name}</Text>
              <Text style={[styles.previewCardGroup, { color: colors.cyan }]}>{w.groupName}</Text>
            </View>
            {w.exercises.slice(0, 5).map((ex, j) => (
              <View key={j} style={styles.exerciseRow}>
                <Feather name="activity" size={12} color={colors.mutedForeground} />
                <Text style={[styles.exerciseName, { color: colors.foreground }]}>
                  {ex.name ?? ex.exerciseId}
                </Text>
                <Text style={[styles.exerciseMeta, { color: colors.mutedForeground }]}>
                  {ex.sets}×{ex.reps}
                </Text>
              </View>
            ))}
            {w.exercises.length > 5 && (
              <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
                +{w.exercises.length - 5} more exercises
              </Text>
            )}
          </GlowCard>
        ))}

        <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
          Weights start at 0 — fill them in as you do each session. Find these in the Workouts tab.
        </Text>

        <View style={styles.actions}>
          <NeonButton title="Import These Workouts" color={colors.cyan} onPress={handleConfirmPdf} />
          <TouchableOpacity onPress={handleReset} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRealmPreview = () => {
    if (!realmResult) return null;
    const hasLogs = realmResult.logs.length > 0;
    return (
      <View>
        {realmResult.warning && (
          <View style={[styles.warningBox, { borderColor: WARN_COLOR }]}>
            <Feather name="alert-triangle" size={14} color={WARN_COLOR} />
            <Text style={[styles.warningText, { color: WARN_COLOR }]}>{realmResult.warning}</Text>
          </View>
        )}

        {hasLogs ? (
          <>
            <View style={styles.previewStats}>
              <View style={[styles.statBadge, { backgroundColor: colors.purple + "22" }]}>
                <Text style={[styles.statNumber, { color: colors.purple }]}>{realmResult.logs.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Workout Sessions</Text>
              </View>
              {(realmResult.programNames?.length ?? 0) > 0 && (
                <View style={[styles.statBadge, { backgroundColor: colors.lime + "22" }]}>
                  <Text style={[styles.statNumber, { color: colors.lime }]}>
                    {realmResult.programNames!.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Programs Found</Text>
                </View>
              )}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SESSIONS TO IMPORT</Text>
            {realmResult.logs.slice(0, 5).map((log, i) => (
              <GlowCard key={i} glowColor={colors.purple} style={styles.previewCard}>
                <View style={styles.previewCardHeader}>
                  <Text style={[styles.previewCardTitle, { color: colors.foreground }]}>{log.workoutName}</Text>
                  <Text style={[styles.previewCardGroup, { color: colors.purple }]}>{log.date}</Text>
                </View>
                {log.exercises.slice(0, 3).map((ex, j) => (
                  <View key={j} style={styles.exerciseRow}>
                    <Feather name="activity" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>
                      {ex.name ?? ex.exerciseId}
                    </Text>
                    <Text style={[styles.exerciseMeta, { color: colors.mutedForeground }]}>
                      {ex.sets.length} sets
                    </Text>
                  </View>
                ))}
                {log.exercises.length > 3 && (
                  <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
                    +{log.exercises.length - 3} more
                  </Text>
                )}
              </GlowCard>
            ))}
            {realmResult.logs.length > 5 && (
              <Text style={[styles.moreText, { color: colors.mutedForeground, marginBottom: 12 }]}>
                …and {realmResult.logs.length - 5} more sessions
              </Text>
            )}

            <View style={styles.actions}>
              <NeonButton
                title={`Import ${realmResult.logs.length} Sessions`}
                color={colors.purple}
                onPress={handleConfirmRealm}
              />
              <TouchableOpacity onPress={handleReset} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sessions found</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              The backup file could not be fully parsed.{"\n\n"}
              Try exporting from FitNotes as CSV:{"\n"}
              FitNotes → Settings → Export → Share as CSV
            </Text>
            <TouchableOpacity onPress={handleReset} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.cyan }]}>Try another file</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderDoneScreen = () => (
    <View style={styles.centeredContent}>
      <View style={[styles.doneIcon, { backgroundColor: colors.lime + "22" }]}>
        <Feather name="check-circle" size={48} color={colors.lime} />
      </View>
      <Text style={[styles.doneTitle, { color: colors.foreground }]}>Import Complete!</Text>
      <Text style={[styles.doneSubtitle, { color: colors.mutedForeground }]}>
        {importType === "history"
          ? "Your workout history has been added to your logs."
          : "Your workout plan has been added. Find it in the Workouts tab."}
      </Text>
      <View style={{ marginTop: 24, width: "100%" }}>
        <NeonButton
          title={importType === "history" ? "View Logs" : "View Workouts"}
          color={colors.lime}
          onPress={() => {
            if (importType === "history") {
              router.replace("/(tabs)/logs" as never);
            } else {
              router.replace("/(tabs)/" as never);
            }
          }}
        />
        <TouchableOpacity onPress={handleReset} style={[styles.cancelBtn, { marginTop: 12 }]}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Import another file</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Import Data</Text>
          <View style={{ width: 22 }} />
        </View>

        {step === "pick" && renderPickScreen()}
        {step === "uploading" && renderUploadingScreen()}
        {step === "preview" && importType === "plan" && renderPdfPreview()}
        {step === "preview" && importType === "history" && renderRealmPreview()}
        {step === "done" && renderDoneScreen()}
      </ScrollView>

      {/* FitNotes export tip modal */}
      <Modal visible={showTipModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>How to export from FitNotes</Text>
            {[
              "1. Open FitNotes on your iPhone",
              "2. Tap the ≡ menu (top left)",
              "3. Go to Settings → Backup & Restore",
              "4. Tap 'Share Backup File'",
              "5. Save the .realm file to Files app",
              "6. Come back here → Import Workout History",
            ].map((s, i) => (
              <Text key={i} style={[styles.tipStep, { color: i === 0 ? colors.foreground : colors.mutedForeground }]}>
                {s}
              </Text>
            ))}
            <TouchableOpacity
              onPress={() => setShowTipModal(false)}
              style={[styles.modalClose, { backgroundColor: colors.purple }]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  importCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  importIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  importCardText: { flex: 1 },
  importCardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  importCardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 20, alignSelf: "center" },
  tipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16, backgroundColor: "#2a0a0a" },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  warningBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16, backgroundColor: "#1a1500" },
  warningText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  previewStats: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statBadge: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  statNumber: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  previewCard: { marginBottom: 10, padding: 14 },
  previewCardHeader: { marginBottom: 10 },
  previewCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  previewCardGroup: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 3 },
  exerciseName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  exerciseMeta: { fontSize: 12, fontFamily: "Inter_500Medium" },
  moreText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  noteText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginVertical: 12 },
  actions: { gap: 8, marginTop: 8 },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  centeredContent: { alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 16 },
  loadingTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginTop: 20, textAlign: "center" },
  loadingSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center" },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  doneIcon: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  doneTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 8 },
  doneSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 24 },
  modalContent: { borderRadius: 16, padding: 24, gap: 8 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8 },
  tipStep: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  modalClose: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
});
