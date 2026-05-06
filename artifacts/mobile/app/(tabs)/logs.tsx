import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { SwipeableCard } from "@/components/SwipeableCard";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function LogsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logs, exercises, deleteLog } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const logDates = useMemo(() => {
    const dates: Record<string, typeof logs> = {};
    logs.forEach((log) => {
      if (!dates[log.date]) dates[log.date] = [];
      dates[log.date].push(log);
    });
    return dates;
  }, [logs]);

  const selectedLogs = selectedDate ? logDates[selectedDate] || [] : [];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const getExName = (id: string) => exercises.find((e) => e.id === id)?.name || "Unknown";

  const calcVolume = (log: typeof logs[0]) => {
    let vol = 0;
    log.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) vol += s.reps * s.weight;
      });
    });
    return vol;
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<View key={`empty-${i}`} style={styles.dayCell} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const hasLog = !!logDates[dateStr];
    const isSelected = selectedDate === dateStr;
    const isToday = dateStr === new Date().toISOString().split("T")[0];

    calendarDays.push(
      <TouchableOpacity
        key={day}
        style={[
          styles.dayCell,
          isSelected && { backgroundColor: colors.purple + "30", borderRadius: 8 },
        ]}
        onPress={() => setSelectedDate(dateStr)}
      >
        <Text
          style={[
            styles.dayText,
            { color: isToday ? colors.cyan : colors.foreground },
            isSelected && { color: colors.purple },
          ]}
        >
          {day}
        </Text>
        {hasLog && (
          <View
            style={[
              styles.dot,
              { backgroundColor: isSelected ? colors.purple : colors.lime },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Training Log</Text>

        <GlowCard glowColor={colors.cyan}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth}>
              <Feather name="chevron-left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: colors.foreground }]}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={nextMonth}>
              <Feather name="chevron-right" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={styles.dayLabels}>
            {DAY_LABELS.map((d, i) => (
              <Text key={i} style={[styles.dayLabel, { color: colors.mutedForeground }]}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>{calendarDays}</View>
        </GlowCard>

        {selectedDate && (
          <View style={styles.selectedSection}>
            <Text style={[styles.selectedDateText, { color: colors.cyan }]}>
              {selectedDate}
            </Text>
            {selectedLogs.length === 0 ? (
              <Text style={[styles.noLogs, { color: colors.mutedForeground }]}>
                No workouts on this day
              </Text>
            ) : (
              selectedLogs.map((log) => (
                <SwipeableCard
                  key={log.id}
                  onEdit={() => router.push({ pathname: "/log/[id]", params: { id: log.id } })}
                  onDelete={() => {
                    Alert.alert(
                      "Delete log?",
                      "This will permanently remove this workout from your history.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteLog(log.id) },
                      ]
                    );
                  }}
                  editLabel="View"
                  deleteLabel="Delete"
                  style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.pink + "30", marginBottom: 12 }}
                >
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/log/[id]", params: { id: log.id } })}
                    activeOpacity={0.85}
                  >
                    <GlowCard glowColor={colors.pink} style={{ marginBottom: 0 }}>
                      <View style={styles.logTitleRow}>
                        <Text style={[styles.logWorkoutName, { color: colors.foreground }]}>
                          {log.workoutName}
                        </Text>
                        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                      </View>
                      <View style={styles.logMeta}>
                        <View style={styles.logStat}>
                          <Feather name="clock" size={14} color={colors.cyan} />
                          <Text style={[styles.logStatText, { color: colors.mutedForeground }]}>
                            {log.duration} min
                          </Text>
                        </View>
                        <View style={styles.logStat}>
                          <Feather name="activity" size={14} color={colors.lime} />
                          <Text style={[styles.logStatText, { color: colors.mutedForeground }]}>
                            {log.exercises.length} exercises
                          </Text>
                        </View>
                        <View style={styles.logStat}>
                          <Feather name="bar-chart-2" size={14} color={colors.pink} />
                          <Text style={[styles.logStatText, { color: colors.mutedForeground }]}>
                            {calcVolume(log).toLocaleString()} vol
                          </Text>
                        </View>
                      </View>
                      {log.exercises.slice(0, 3).map((ex, idx) => (
                        <View key={idx} style={styles.logExercise}>
                          <Text style={[styles.logExName, { color: colors.foreground }]}>
                            {getExName(ex.exerciseId)}
                          </Text>
                          <Text style={[styles.logExDetail, { color: colors.mutedForeground }]}>
                            {ex.sets.filter((s) => s.completed).length} sets
                          </Text>
                        </View>
                      ))}
                      {log.exercises.length > 3 && (
                        <Text style={[styles.logExDetail, { color: colors.purple, marginTop: 2 }]}>
                          +{log.exercises.length - 3} more exercises
                        </Text>
                      )}
                      <View style={styles.editHint}>
                        <Feather name="move-horizontal" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.editHintText, { color: colors.mutedForeground }]}>
                          swipe right to view · swipe left to delete
                        </Text>
                      </View>
                    </GlowCard>
                  </TouchableOpacity>
                </SwipeableCard>
              ))
            )}
          </View>
        )}

        <View style={{ height: Platform.OS === "web" ? 34 + 84 : 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 20 },
  monthNav: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  monthText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  dayLabels: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    marginBottom: 8,
  },
  dayLabel: { fontSize: 12, fontFamily: "Inter_500Medium", width: "14.28%" as any, textAlign: "center" as const },
  calendarGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const },
  dayCell: {
    width: "14.28%" as any,
    alignItems: "center" as const,
    paddingVertical: 8,
  },
  dayText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  selectedSection: { marginTop: 16 },
  selectedDateText: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  noLogs: { fontSize: 14, fontFamily: "Inter_400Regular" },
  logTitleRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 8 },
  logWorkoutName: { fontSize: 18, fontFamily: "Inter_600SemiBold", flex: 1 },
  editHint: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, marginTop: 8, opacity: 0.6 },
  editHintText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  logMeta: { flexDirection: "row" as const, gap: 16, marginBottom: 12 },
  logStat: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 },
  logStatText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  logExercise: { paddingVertical: 4 },
  logExName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  logExDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
