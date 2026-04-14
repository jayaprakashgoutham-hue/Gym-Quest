import { Exercise, Workout, WorkoutLog, UserProfile, Achievement } from "./types";

export const defaultAchievements: Achievement[] = [
  { id: "first_rep", name: "First Rep", description: "Log your first workout", icon: "award", unlocked: false, target: "1 workout" },
  { id: "consistent", name: "Consistent", description: "7 day workout streak", icon: "trending-up", unlocked: false, target: "7 day streak" },
  { id: "centurion", name: "Centurion", description: "Complete 100 workouts", icon: "star", unlocked: false, target: "100 workouts" },
  { id: "heavy_lifter", name: "Heavy Lifter", description: "Bench press reaches 100kg", icon: "zap", unlocked: false, target: "100kg bench" },
  { id: "volume_king", name: "Volume King", description: "Training volume exceeds 10,000 in one session", icon: "bar-chart-2", unlocked: false, target: "10,000 volume" },
  { id: "iron_will", name: "Iron Will", description: "Complete 50 workouts", icon: "shield", unlocked: false, target: "50 workouts" },
  { id: "marathon", name: "Marathon", description: "14 day workout streak", icon: "flag", unlocked: false, target: "14 day streak" },
  { id: "dedicated", name: "Dedicated", description: "30 day workout streak", icon: "heart", unlocked: false, target: "30 day streak" },
];

export const sampleExercises: Exercise[] = [
  { id: "1", name: "Bench Press", focus: "reps_weight", equipment: "Barbell", category: "Chest" },
  { id: "2", name: "Squat", focus: "reps_weight", equipment: "Barbell", category: "Legs" },
  { id: "3", name: "Deadlift", focus: "reps_weight", equipment: "Barbell", category: "Back" },
  { id: "4", name: "Overhead Press", focus: "reps_weight", equipment: "Barbell", category: "Shoulders" },
  { id: "5", name: "Barbell Row", focus: "reps_weight", equipment: "Barbell", category: "Back" },
  { id: "6", name: "Pull-up", focus: "reps_weight", equipment: "Bodyweight", category: "Back" },
  { id: "7", name: "Dumbbell Curl", focus: "reps_weight", equipment: "Dumbbell", category: "Arms" },
  { id: "8", name: "Tricep Pushdown", focus: "reps_weight", equipment: "Cable", category: "Arms" },
  { id: "9", name: "Lateral Raise", focus: "reps_weight", equipment: "Dumbbell", category: "Shoulders" },
  { id: "10", name: "Leg Press", focus: "reps_weight", equipment: "Machine", category: "Legs" },
  { id: "11", name: "Leg Curl", focus: "reps_weight", equipment: "Machine", category: "Legs" },
  { id: "12", name: "Leg Extension", focus: "reps_weight", equipment: "Machine", category: "Legs" },
  { id: "13", name: "Calf Raise", focus: "reps_weight", equipment: "Machine", category: "Legs" },
  { id: "14", name: "Incline Bench Press", focus: "reps_weight", equipment: "Barbell", category: "Chest" },
  { id: "15", name: "Decline Bench Press", focus: "reps_weight", equipment: "Barbell", category: "Chest" },
  { id: "16", name: "Dumbbell Fly", focus: "reps_weight", equipment: "Dumbbell", category: "Chest" },
  { id: "17", name: "Cable Crossover", focus: "reps_weight", equipment: "Cable", category: "Chest" },
  { id: "18", name: "Face Pull", focus: "reps_weight", equipment: "Cable", category: "Shoulders" },
  { id: "19", name: "Hammer Curl", focus: "reps_weight", equipment: "Dumbbell", category: "Arms" },
  { id: "20", name: "Skull Crusher", focus: "reps_weight", equipment: "Barbell", category: "Arms" },
  { id: "21", name: "Preacher Curl", focus: "reps_weight", equipment: "Barbell", category: "Arms" },
  { id: "22", name: "Dumbbell Shoulder Press", focus: "reps_weight", equipment: "Dumbbell", category: "Shoulders" },
  { id: "23", name: "Front Squat", focus: "reps_weight", equipment: "Barbell", category: "Legs" },
  { id: "24", name: "Romanian Deadlift", focus: "reps_weight", equipment: "Barbell", category: "Legs" },
  { id: "25", name: "Hip Thrust", focus: "reps_weight", equipment: "Barbell", category: "Legs" },
  { id: "26", name: "Lat Pulldown", focus: "reps_weight", equipment: "Cable", category: "Back" },
  { id: "27", name: "Seated Row", focus: "reps_weight", equipment: "Cable", category: "Back" },
  { id: "28", name: "T-Bar Row", focus: "reps_weight", equipment: "Barbell", category: "Back" },
  { id: "29", name: "Dumbbell Row", focus: "reps_weight", equipment: "Dumbbell", category: "Back" },
  { id: "30", name: "Chest Dip", focus: "reps_weight", equipment: "Bodyweight", category: "Chest" },
  { id: "31", name: "Tricep Dip", focus: "reps_weight", equipment: "Bodyweight", category: "Arms" },
  { id: "32", name: "Push-up", focus: "reps_weight", equipment: "Bodyweight", category: "Chest" },
  { id: "33", name: "Chin-up", focus: "reps_weight", equipment: "Bodyweight", category: "Back" },
  { id: "34", name: "Plank", focus: "time", equipment: "Bodyweight", category: "Core" },
  { id: "35", name: "Ab Crunch", focus: "reps_weight", equipment: "Bodyweight", category: "Core" },
  { id: "36", name: "Hanging Leg Raise", focus: "reps_weight", equipment: "Bodyweight", category: "Core" },
  { id: "37", name: "Cable Crunch", focus: "reps_weight", equipment: "Cable", category: "Core" },
  { id: "38", name: "Russian Twist", focus: "reps_weight", equipment: "Bodyweight", category: "Core" },
  { id: "39", name: "Dumbbell Lunge", focus: "reps_weight", equipment: "Dumbbell", category: "Legs" },
  { id: "40", name: "Bulgarian Split Squat", focus: "reps_weight", equipment: "Dumbbell", category: "Legs" },
  { id: "41", name: "Hack Squat", focus: "reps_weight", equipment: "Machine", category: "Legs" },
  { id: "42", name: "Sumo Deadlift", focus: "reps_weight", equipment: "Barbell", category: "Legs" },
  { id: "43", name: "Pec Deck", focus: "reps_weight", equipment: "Machine", category: "Chest" },
  { id: "44", name: "Machine Shoulder Press", focus: "reps_weight", equipment: "Machine", category: "Shoulders" },
  { id: "45", name: "Reverse Fly", focus: "reps_weight", equipment: "Dumbbell", category: "Shoulders" },
  { id: "46", name: "Shrug", focus: "reps_weight", equipment: "Dumbbell", category: "Shoulders" },
  { id: "47", name: "Concentration Curl", focus: "reps_weight", equipment: "Dumbbell", category: "Arms" },
  { id: "48", name: "Overhead Tricep Extension", focus: "reps_weight", equipment: "Dumbbell", category: "Arms" },
  { id: "49", name: "Treadmill Run", focus: "time", equipment: "Machine", category: "Cardio" },
  { id: "50", name: "Cycling", focus: "time", equipment: "Machine", category: "Cardio" },
  { id: "51", name: "Rowing Machine", focus: "time", equipment: "Machine", category: "Cardio" },
  { id: "52", name: "Jump Rope", focus: "time", equipment: "Bodyweight", category: "Cardio" },
];

export const sampleWorkouts: Workout[] = [
  {
    id: "w1",
    name: "Chest & Triceps",
    groupName: "5 Day Split",
    exercises: [
      { exerciseId: "1", sets: 4, reps: 8, weight: 80 },
      { exerciseId: "14", sets: 3, reps: 10, weight: 60 },
      { exerciseId: "16", sets: 3, reps: 12, weight: 14 },
      { exerciseId: "17", sets: 3, reps: 15, weight: 20 },
      { exerciseId: "8", sets: 3, reps: 12, weight: 30 },
      { exerciseId: "20", sets: 3, reps: 10, weight: 25 },
    ],
    lastCompleted: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
  },
  {
    id: "w2",
    name: "Back & Biceps",
    groupName: "5 Day Split",
    exercises: [
      { exerciseId: "3", sets: 4, reps: 5, weight: 120 },
      { exerciseId: "5", sets: 4, reps: 8, weight: 70 },
      { exerciseId: "26", sets: 3, reps: 10, weight: 60 },
      { exerciseId: "6", sets: 3, reps: 8, weight: 0 },
      { exerciseId: "7", sets: 3, reps: 12, weight: 14 },
      { exerciseId: "19", sets: 3, reps: 12, weight: 12 },
    ],
    lastCompleted: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
  },
  {
    id: "w3",
    name: "Legs",
    groupName: "5 Day Split",
    exercises: [
      { exerciseId: "2", sets: 4, reps: 6, weight: 100 },
      { exerciseId: "10", sets: 3, reps: 10, weight: 150 },
      { exerciseId: "24", sets: 3, reps: 10, weight: 80 },
      { exerciseId: "11", sets: 3, reps: 12, weight: 40 },
      { exerciseId: "12", sets: 3, reps: 12, weight: 40 },
      { exerciseId: "13", sets: 4, reps: 15, weight: 60 },
    ],
  },
  {
    id: "w4",
    name: "Shoulders",
    groupName: "5 Day Split",
    exercises: [
      { exerciseId: "4", sets: 4, reps: 8, weight: 50 },
      { exerciseId: "9", sets: 4, reps: 12, weight: 10 },
      { exerciseId: "18", sets: 3, reps: 15, weight: 15 },
      { exerciseId: "22", sets: 3, reps: 10, weight: 20 },
      { exerciseId: "45", sets: 3, reps: 12, weight: 8 },
      { exerciseId: "46", sets: 3, reps: 12, weight: 24 },
    ],
  },
  {
    id: "w5",
    name: "Arms & Core",
    groupName: "5 Day Split",
    exercises: [
      { exerciseId: "7", sets: 4, reps: 10, weight: 14 },
      { exerciseId: "21", sets: 3, reps: 10, weight: 25 },
      { exerciseId: "8", sets: 3, reps: 12, weight: 30 },
      { exerciseId: "48", sets: 3, reps: 12, weight: 16 },
      { exerciseId: "36", sets: 3, reps: 12, weight: 0 },
      { exerciseId: "37", sets: 3, reps: 15, weight: 30 },
    ],
  },
  {
    id: "w6",
    name: "Full Body A",
    groupName: "Full Body",
    exercises: [
      { exerciseId: "2", sets: 3, reps: 8, weight: 80 },
      { exerciseId: "1", sets: 3, reps: 8, weight: 70 },
      { exerciseId: "5", sets: 3, reps: 8, weight: 60 },
      { exerciseId: "4", sets: 3, reps: 10, weight: 40 },
    ],
  },
  {
    id: "w7",
    name: "Full Body B",
    groupName: "Full Body",
    exercises: [
      { exerciseId: "3", sets: 3, reps: 5, weight: 100 },
      { exerciseId: "14", sets: 3, reps: 10, weight: 55 },
      { exerciseId: "26", sets: 3, reps: 10, weight: 55 },
      { exerciseId: "9", sets: 3, reps: 15, weight: 8 },
    ],
  },
];

function generateSampleLogs(): WorkoutLog[] {
  const logs: WorkoutLog[] = [];
  const today = new Date();

  for (let i = 1; i <= 15; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 2);
    const dateStr = d.toISOString().split("T")[0];
    const workoutIndex = i % 5;
    const workout = sampleWorkouts[workoutIndex];
    const logId = `log_${i}`;

    const loggedExercises = workout.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: ex.reps + Math.floor(Math.random() * 3) - 1,
        weight: ex.weight + Math.floor(Math.random() * 5),
        completed: true,
      })),
    }));

    logs.push({
      id: logId,
      workoutId: workout.id,
      workoutName: workout.name,
      date: dateStr,
      duration: 45 + Math.floor(Math.random() * 30),
      exercises: loggedExercises,
    });
  }

  return logs;
}

export const sampleLogs = generateSampleLogs();

export const defaultProfile: UserProfile = {
  xp: 2350,
  level: 8,
  streak: 4,
  lastWorkoutDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
  totalWorkouts: 15,
  achievements: defaultAchievements.map((a) =>
    a.id === "first_rep" ? { ...a, unlocked: true, unlockedDate: "2024-01-15" } : a
  ),
  bodyWeight: [
    { date: new Date(Date.now() - 86400000 * 30).toISOString().split("T")[0], weight: 82 },
    { date: new Date(Date.now() - 86400000 * 25).toISOString().split("T")[0], weight: 81.5 },
    { date: new Date(Date.now() - 86400000 * 20).toISOString().split("T")[0], weight: 81.2 },
    { date: new Date(Date.now() - 86400000 * 15).toISOString().split("T")[0], weight: 80.8 },
    { date: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0], weight: 80.3 },
    { date: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0], weight: 79.9 },
    { date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], weight: 79.5 },
  ],
  personalRecords: {
    "1": 95,
    "2": 120,
    "3": 160,
    "4": 60,
  },
  weightUnit: "kg",
  restTimerDuration: 90,
  restTimerSound: true,
  defaultSets: 3,
  defaultReps: 10,
  rpeEnabled: false,
};
