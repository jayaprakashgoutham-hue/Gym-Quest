// Shared types mirrored from mobile store/types.ts for import parsing

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  name?: string; // display name for imported exercises
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
  name?: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: LoggedExercise[];
}
