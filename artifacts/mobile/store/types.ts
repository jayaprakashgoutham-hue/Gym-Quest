export type MovementPattern =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "isolation_curl"
  | "isolation_extension"
  | "isolation_raise"
  | "core"
  | "carry"
  | "static"
  | "cardio";

export interface Exercise {
  id: string;
  name: string;
  focus: "reps_weight" | "time" | "distance";
  equipment: string;
  category: string;
  description?: string;
  instructions?: string[];
  tips?: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  movementPattern?: MovementPattern;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  name: string;
  groupName: string;
  exercises: WorkoutExercise[];
  lastCompleted?: string;
}

export interface LoggedSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: LoggedExercise[];
}

export interface BodyWeightEntry {
  date: string;
  weight: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  target?: string;
}

export interface UserProfile {
  xp: number;
  level: number;
  streak: number;
  lastWorkoutDate?: string;
  totalWorkouts: number;
  achievements: Achievement[];
  bodyWeight: BodyWeightEntry[];
  personalRecords: Record<string, number>;
  weightUnit: "kg" | "lbs";
  restTimerDuration: number;
  restTimerSound: boolean;
  defaultSets: number;
  defaultReps: number;
  rpeEnabled: boolean;
}

export interface AppState {
  exercises: Exercise[];
  workouts: Workout[];
  logs: WorkoutLog[];
  profile: UserProfile;
}

export interface Settings {
  weightUnit: "kg" | "lbs";
  restTimerDuration: number;
  restTimerSound: boolean;
  defaultSets: number;
  defaultReps: number;
  rpeEnabled: boolean;
}
