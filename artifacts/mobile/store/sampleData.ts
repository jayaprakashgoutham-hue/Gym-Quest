import { exerciseLibrary } from "./exerciseLibrary";
import type { Exercise, Workout, WorkoutLog, UserProfile, Achievement } from "./types";

export const sampleExercises: Exercise[] = exerciseLibrary;

export const defaultAchievements: Achievement[] = [
  { id: "first_rep", name: "First Rep", description: "Complete your first workout", icon: "flag", unlocked: false, target: "1 workout" },
  { id: "consistent", name: "Consistent", description: "7-day workout streak", icon: "trending-up", unlocked: false, target: "7-day streak" },
  { id: "centurion", name: "Centurion", description: "100 total workouts", icon: "award", unlocked: false, target: "100 workouts" },
  { id: "iron_will", name: "Iron Will", description: "50 total workouts", icon: "shield", unlocked: false, target: "50 workouts" },
  { id: "marathon", name: "Marathon", description: "14-day workout streak", icon: "calendar", unlocked: false, target: "14-day streak" },
  { id: "dedicated", name: "Dedicated", description: "30-day workout streak", icon: "star", unlocked: false, target: "30-day streak" },
  { id: "volume_king", name: "Volume King", description: "10,000+ kg moved in a single session", icon: "bar-chart-2", unlocked: false, target: "10,000 vol" },
  { id: "heavy_lifter", name: "Heavy Lifter", description: "Bench press 100kg+", icon: "zap", unlocked: false, target: "100kg bench" },
];

export const sampleWorkouts: Workout[] = [];

export const sampleLogs: WorkoutLog[] = [];

export const defaultProfile: UserProfile = {
  xp: 0,
  level: 1,
  streak: 0,
  lastWorkoutDate: undefined,
  totalWorkouts: 0,
  achievements: defaultAchievements.map((a) => ({ ...a })),
  bodyWeight: [],
  personalRecords: {},
  weightUnit: "kg",
  restTimerDuration: 90,
  restTimerSound: true,
  defaultSets: 3,
  defaultReps: 10,
  rpeEnabled: false,
};
