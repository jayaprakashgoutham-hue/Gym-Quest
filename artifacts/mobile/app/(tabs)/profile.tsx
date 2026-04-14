import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/store/AppContext";
import { GlowCard } from "@/components/GlowCard";
import { XPBar } from "@/components/XPBar";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const router = useRouter();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Feather name="settings" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <GlowCard glowColor={colors.cyan}>
          <XPBar xp={profile.xp} level={profile.level} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.lime }]}>{profile.streak}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.purple }]}>{profile.totalWorkouts}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Workouts</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.pink }]}>{profile.xp}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total XP</Text>
            </View>
          </View>
        </GlowCard>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>

        {profile.achievements.map((achievement) => (
          <GlowCard
            key={achievement.id}
            glowColor={achievement.unlocked ? colors.lime : colors.border}
            style={{ opacity: achievement.unlocked ? 1 : 0.5 }}
          >
            <View style={styles.achievementRow}>
              <View
                style={[
                  styles.achievementIcon,
                  {
                    backgroundColor: achievement.unlocked ? colors.lime + "20" : colors.secondary,
                  },
                ]}
              >
                <Feather
                  name={achievement.icon as any}
                  size={22}
                  color={achievement.unlocked ? colors.lime : colors.mutedForeground}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, { color: colors.foreground }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDesc, { color: colors.mutedForeground }]}>
                  {achievement.description}
                </Text>
                {!achievement.unlocked && achievement.target && (
                  <Text style={[styles.achievementTarget, { color: colors.purple }]}>
                    Target: {achievement.target}
                  </Text>
                )}
                {achievement.unlocked && achievement.unlockedDate && (
                  <Text style={[styles.achievementTarget, { color: colors.lime }]}>
                    Unlocked: {achievement.unlockedDate}
                  </Text>
                )}
              </View>
              {achievement.unlocked && (
                <Feather name="check-circle" size={20} color={colors.lime} />
              )}
              {!achievement.unlocked && (
                <Feather name="lock" size={18} color={colors.mutedForeground} />
              )}
            </View>
          </GlowCard>
        ))}

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
    marginBottom: 20,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    marginTop: 8,
  },
  statItem: { alignItems: "center" as const, flex: 1 },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: 1, height: 40 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", marginBottom: 12, marginTop: 8 },
  achievementRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  achievementInfo: { flex: 1 },
  achievementName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  achievementDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  achievementTarget: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
});
