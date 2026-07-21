import { Router } from "express";
import multer from "multer";
import fs from "fs";
import type { WorkoutLog, LoggedExercise, LoggedSet } from "../types.js";

const router = Router();
const upload = multer({ dest: "/tmp/gymquest-imports/", limits: { fileSize: 50 * 1024 * 1024 } });

// ─── Realm binary string extractor ──────────────────────────────────────────
// Realm files store text as UTF-8 strings. We extract all readable sequences
// and then pattern-match FitNotes log data from them.

function extractStrings(buf: Buffer, minLen = 3): string[] {
  const results: string[] = [];
  let start = -1;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    const printable = b >= 0x20 && b <= 0x7e;
    if (printable) {
      if (start === -1) start = i;
    } else {
      if (start !== -1 && i - start >= minLen) {
        results.push(buf.slice(start, i).toString("ascii"));
      }
      start = -1;
    }
  }
  return results;
}

// Try to use Realm SDK for proper parsing. Returns null if Realm not available.
async function parseWithRealmSdk(filePath: string): Promise<WorkoutLog[] | null> {
  try {
    // Dynamic import so the server starts even if realm native module fails
    const { Realm } = await import("realm");

    // Open the Realm file read-only without a schema to discover its classes
    const realm = await Realm.open({
      path: filePath,
      readOnly: true,
      // No schema means Realm will open in dynamic mode (ObjectSchema inferred)
      schema: [],
    });

    const logs: WorkoutLog[] = [];

    // Enumerate all object classes in the file
    const classNames = realm.schema.map((s) => s.name);

    // Look for workout-log-like classes (FitNotes uses WorkoutRecord, ExerciseRecord, SetRecord)
    const workoutClass = classNames.find((n) =>
      /workout.*record|log.*entry|session/i.test(n)
    );
    const exerciseClass = classNames.find((n) =>
      /exercise.*record|exercise.*set/i.test(n)
    );
    const setClass = classNames.find((n) => /set.*record|rep.*record/i.test(n));

    if (!workoutClass) {
      realm.close();
      return null;
    }

    const workoutObjects = realm.objects(workoutClass);
    for (const obj of workoutObjects) {
      const raw = obj.toJSON() as Record<string, unknown>;

      // Find date field
      const dateVal =
        (raw["date"] as string | Date) ??
        (raw["startDate"] as string | Date) ??
        (raw["createdAt"] as string | Date);
      const dateStr = dateVal
        ? new Date(dateVal as string).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // Find exercise list field
      const exField = Object.keys(raw).find((k) =>
        /exercise|set|entry/i.test(k) && Array.isArray(raw[k])
      );
      const exercises: LoggedExercise[] = [];

      if (exField && exerciseClass) {
        const exList = raw[exField] as Record<string, unknown>[];
        for (const ex of exList) {
          const exName =
            (ex["name"] as string) ??
            (ex["exerciseName"] as string) ??
            (ex["title"] as string) ??
            "Unknown Exercise";

          const setField = Object.keys(ex).find((k) =>
            /set|rep|record/i.test(k) && Array.isArray(ex[k])
          );
          const sets: LoggedSet[] = [];

          if (setField) {
            for (const s of ex[setField] as Record<string, unknown>[]) {
              sets.push({
                reps: Number(s["reps"] ?? s["repetitions"] ?? s["count"] ?? 0),
                weight: Number(s["weight"] ?? s["load"] ?? s["kg"] ?? 0),
                completed: true,
              });
            }
          }

          exercises.push({
            exerciseId: `fitnotes-${exName.toLowerCase().replace(/\s+/g, "-")}`,
            name: exName,
            sets: sets.length > 0 ? sets : [{ reps: 10, weight: 0, completed: true }],
          });
        }
      }

      logs.push({
        id: `fitnotes-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        workoutId: "imported",
        workoutName: (raw["name"] as string) ?? (raw["title"] as string) ?? "Workout",
        date: dateStr,
        duration: Number(raw["duration"] ?? raw["durationSeconds"] ?? 0),
        exercises,
      });
    }

    realm.close();
    return logs;
  } catch {
    return null;
  }
}

// ─── Fallback: string-based extraction ─────────────────────────────────────

interface ExtractedData {
  programNames: string[];
  dates: string[];
  notes: string[];
  exerciseNames: string[];
}

function extractFitNotesData(buf: Buffer): ExtractedData {
  const strings = extractStrings(buf, 3);

  // FitNotes program names are typically longer strings without fitnotes/ prefix
  const programNames: string[] = [];
  const dates: string[] = [];
  const notes: string[] = [];
  const exerciseNames: string[] = [];

  const knownExerciseWords = /squat|bench|deadlift|press|curl|row|pull|push|lunge|fly|flye|raise|crunch|plank|dip|shrug|extension|pulldown|pushdown|carry|twist|hold/i;

  for (const s of strings) {
    const trimmed = s.trim();
    if (!trimmed || trimmed.length < 3) continue;

    // Settings keys – skip
    if (trimmed.startsWith("/fitnotes/") || trimmed.startsWith("com.") || trimmed.startsWith("io.")) continue;

    // Dates
    if (/^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}/.test(trimmed)) {
      const parts = trimmed.split(/\s+/)[0].split("-");
      if (parts.length === 3) {
        dates.push(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
      }
      continue;
    }

    // ISO dates
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      dates.push(trimmed.slice(0, 10));
      continue;
    }

    // Program names: readable strings 5–80 chars with mixed case, containing letters
    if (
      trimmed.length >= 5 &&
      trimmed.length <= 80 &&
      /[A-Za-z]{3,}/.test(trimmed) &&
      !/^[A-Z_]+$/.test(trimmed) && // not all-caps constants
      !/\{|\}|\[|\]|<|>/.test(trimmed) && // not JSON/XML
      !/^(true|false|null|version|metadata)$/i.test(trimmed)
    ) {
      if (knownExerciseWords.test(trimmed) && trimmed.split(/\s+/).length <= 6) {
        exerciseNames.push(trimmed);
      } else if (/program|ppl|push|pull|leg|upper|lower|split|training|workout|rehab/i.test(trimmed)) {
        programNames.push(trimmed);
      } else if (trimmed.length >= 10 && /[.!?,]|did|set|rep|kg|lbs/i.test(trimmed)) {
        notes.push(trimmed);
      }
    }
  }

  return {
    programNames: [...new Set(programNames)],
    dates: [...new Set(dates)].sort(),
    notes: [...new Set(notes)].slice(0, 20),
    exerciseNames: [...new Set(exerciseNames)],
  };
}

// Build best-effort logs from string extraction
function buildLogsFromStrings(data: ExtractedData): WorkoutLog[] {
  const logs: WorkoutLog[] = [];

  // Group known exercise names into workout sessions by date
  if (data.dates.length === 0 && data.exerciseNames.length === 0) return logs;

  // Create one log per unique date found, with all exercise names attached
  // (We can't know which exercises map to which date from strings alone,
  //  so we create one session per date with all recognized exercises)
  const dates = data.dates.length > 0 ? data.dates : [new Date().toISOString().split("T")[0]];

  // Distribute exercises across dates (best-effort)
  const exPerDay = Math.ceil(data.exerciseNames.length / Math.max(dates.length, 1));

  dates.forEach((date, i) => {
    const dayExercises = data.exerciseNames.slice(i * exPerDay, (i + 1) * exPerDay);
    if (dayExercises.length === 0 && i > 0) return; // skip empty days

    logs.push({
      id: `fitnotes-${date}-${Math.random().toString(36).slice(2, 7)}`,
      workoutId: "imported",
      workoutName: data.programNames[i % data.programNames.length] ?? "Imported Workout",
      date,
      duration: 0,
      exercises: dayExercises.map((name) => ({
        exerciseId: `fitnotes-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        sets: [{ reps: 10, weight: 0, completed: true }],
      })),
    });
  });

  return logs;
}

// ─── Route ──────────────────────────────────────────────────────────────────

router.post("/import/realm", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const filePath = req.file.path;

    // Attempt proper Realm SDK parsing first
    let logs = await parseWithRealmSdk(filePath);
    let method = "realm-sdk";

    if (!logs || logs.length === 0) {
      // Fallback: string extraction
      const buf = fs.readFileSync(filePath);
      const data = extractFitNotesData(buf);
      logs = buildLogsFromStrings(data);
      method = "string-extraction";

      res.json({
        logs,
        method,
        programNames: data.programNames,
        dates: data.dates,
        warning:
          logs.length === 0
            ? "Could not extract individual workout sessions. The binary format requires the Realm SDK. Try exporting as CSV from FitNotes instead."
            : "Partial import: exercise grouping is approximate since exact sets/reps/weights are stored in binary. Weights will show as 0 — you can edit them after import.",
      });
      return;
    }

    res.json({ logs, method });
  } catch (err) {
    res.status(500).json({ error: "Failed to parse realm file: " + (err instanceof Error ? err.message : String(err)) });
  } finally {
    try { if (req.file) fs.unlinkSync(req.file.path); } catch {}
  }
});

export default router;
