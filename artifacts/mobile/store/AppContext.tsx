import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { exerciseLibrary } from "./exerciseLibrary";
import { sampleWorkouts, sampleLogs, defaultProfile, defaultAchievements } from "./sampleData";
import type { Exercise, Workout, WorkoutLog, UserProfile, Settings, LoggedExercise } from "./types";

interface AppContextType {
  exercises: Exercise[];
  workouts: Workout[];
  logs: WorkoutLog[];
  profile: UserProfile;
  addExercise: (exercise: Exercise) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  addLog: (log: WorkoutLog) => void;
  updateLog: (log: WorkoutLog) => void;
  deleteLog: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (settings: Settings) => void;
  addBodyWeight: (weight: number) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  checkAndUnlockAchievements: (log: WorkoutLog) => string[];
  resetData: () => void;
  loaded: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@gymquest_data";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loaded) {
      saveData();
    }
  }, [exercises, workouts, logs, profile, loaded]);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as {
          customExercises?: Exercise[];
          exercises?: Exercise[];
          workouts: Workout[];
          logs: WorkoutLog[];
          profile: UserProfile;
        };
        // Custom exercises are user-added ones (id > 1000 or not in library)
        const libraryIds = new Set(exerciseLibrary.map((e) => e.id));
        const customExercises = (data.customExercises ?? data.exercises ?? []).filter(
          (e) => !libraryIds.has(e.id)
        );
        setExercises([...exerciseLibrary, ...customExercises]);
        setWorkouts(data.workouts ?? []);
        setLogs(data.logs ?? []);
        setProfile(data.profile ?? defaultProfile);
      } else {
        setExercises(exerciseLibrary);
        setWorkouts(sampleWorkouts);
        setLogs(sampleLogs);
        setProfile(defaultProfile);
      }
    } catch {
      setExercises(exerciseLibrary);
      setWorkouts(sampleWorkouts);
      setLogs(sampleLogs);
      setProfile(defaultProfile);
    }
    setLoaded(true);
  };

  const saveData = async () => {
    try {
      const libraryIds = new Set(exerciseLibrary.map((e) => e.id));
      const customExercises = exercises.filter((e) => !libraryIds.has(e.id));
      const data = { customExercises, workouts, logs, profile };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const getExerciseById = useCallback((id: string) => {
    return exercises.find((e) => e.id === id);
  }, [exercises]);

  const addExercise = useCallback((exercise: Exercise) => {
    setExercises((prev) => [...prev, exercise]);
  }, []);

  const addWorkout = useCallback((workout: Workout) => {
    setWorkouts((prev) => [...prev, workout]);
  }, []);

  const updateWorkout = useCallback((workout: Workout) => {
    setWorkouts((prev) => prev.map((w) => (w.id === workout.id ? workout : w)));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const addLog = useCallback((log: WorkoutLog) => {
    setLogs((prev) => [log, ...prev]);
    setProfile((prev) => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = prev.streak;
      if (prev.lastWorkoutDate === yesterday || prev.lastWorkoutDate === today) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }
      return {
        ...prev,
        xp: prev.xp + 150,
        level: Math.floor((prev.xp + 150) / 300) + 1,
        streak: newStreak,
        lastWorkoutDate: today,
        totalWorkouts: prev.totalWorkouts + 1,
      };
    });
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === log.workoutId
          ? { ...w, lastCompleted: log.date }
          : w
      )
    );
  }, []);

  const updateLog = useCallback((log: WorkoutLog) => {
    setLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)));
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setProfile((prev) => ({
      ...prev,
      totalWorkouts: Math.max(0, prev.totalWorkouts - 1),
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((settings: Settings) => {
    setProfile((prev) => ({ ...prev, ...settings }));
  }, []);

  const addBodyWeight = useCallback((weight: number) => {
    const today = new Date().toISOString().split("T")[0];
    setProfile((prev) => ({
      ...prev,
      bodyWeight: [...prev.bodyWeight.filter((e) => e.date !== today), { date: today, weight }],
    }));
  }, []);

  const checkAndUnlockAchievements = useCallback((log: WorkoutLog): string[] => {
    const unlocked: string[] = [];
    setProfile((prev) => {
      const newAchievements = [...prev.achievements];
      const totalWorkouts = prev.totalWorkouts;
      const streak = prev.streak;

      let totalVolume = 0;
      log.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.completed) totalVolume += s.reps * s.weight;
        });
      });

      const checks: Record<string, boolean> = {
        first_rep: totalWorkouts >= 1,
        consistent: streak >= 7,
        centurion: totalWorkouts >= 100,
        iron_will: totalWorkouts >= 50,
        marathon: streak >= 14,
        dedicated: streak >= 30,
        volume_king: totalVolume >= 10000,
      };

      const benchExercise = log.exercises.find((e) => e.exerciseId === "1");
      if (benchExercise) {
        const maxBench = Math.max(...benchExercise.sets.map((s) => s.weight));
        checks.heavy_lifter = maxBench >= 100;
      }

      for (const a of newAchievements) {
        if (!a.unlocked && checks[a.id]) {
          a.unlocked = true;
          a.unlockedDate = new Date().toISOString().split("T")[0];
          unlocked.push(a.name);
        }
      }

      return { ...prev, achievements: newAchievements };
    });
    return unlocked;
  }, []);

  const resetData = useCallback(() => {
    setWorkouts([]);
    setLogs([]);
    setProfile((prev) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastWorkoutDate: undefined,
      totalWorkouts: 0,
      achievements: defaultAchievements.map((a) => ({ ...a, unlocked: false, unlockedDate: undefined })),
      bodyWeight: [],
      personalRecords: {},
      weightUnit: prev.weightUnit,
      restTimerDuration: prev.restTimerDuration,
      restTimerSound: prev.restTimerSound,
      defaultSets: prev.defaultSets,
      defaultReps: prev.defaultReps,
      rpeEnabled: prev.rpeEnabled,
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        exercises, workouts, logs, profile,
        addExercise, addWorkout, updateWorkout, deleteWorkout,
        addLog, updateLog, deleteLog, updateProfile, updateSettings, addBodyWeight,
        getExerciseById, checkAndUnlockAchievements, resetData, loaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
