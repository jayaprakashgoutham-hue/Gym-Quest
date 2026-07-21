import { Router } from "express";
import multer from "multer";
import fs from "fs";
import type { Workout, WorkoutExercise } from "../types.js";

const router = Router();
const upload = multer({ dest: "/tmp/gymquest-imports/", limits: { fileSize: 20 * 1024 * 1024 } });

// ─── PDF text extraction via pdfjs-dist (Node legacy build) ─────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs") as typeof import("pdfjs-dist");

  const data = new Uint8Array(buffer);
  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();

    // Sort items top→bottom, left→right and join with spaces
    const pageText = (content.items as Array<{ str: string; transform: number[] }>)
      .sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 4) return yDiff;
        return a.transform[4] - b.transform[4];
      })
      .map((item) => item.str.trim())
      .filter(Boolean)
      .join("  ");

    pages.push(pageText);
  }

  return pages.join("  ");
}

// ─── Parser ──────────────────────────────────────────────────────────────────

// Slot label prefixes used in structured fitness PDFs (case-insensitive)
const SLOT_PREFIXES = [
  "Pre-?activation", "Strength\\s*\\d*(?:\\s*\\([^)]+\\))?",
  "Hypertrophy\\s*\\d*(?:\\s*\\([^)]+\\))?", "Accessory\\s*\\d*",
  "Mobility\\s*\\d*", "Cooldown\\s*\\d*", "Warmup\\s*\\d*", "Power\\s*\\d*",
  "Biceps?\\s*\\d*", "Triceps?\\s*\\d*", "Forearm[s]?/?Grip",
  "Calves?\\s*\\d*", "Abs?\\s*\\d*", "Core\\s*\\d*", "Cardio\\s*\\d*",
  "Slot\\s*\\d+",
];
const SLOT_REGEX = new RegExp(`^(?:${SLOT_PREFIXES.join("|")})\\b`, "i");

// Equipment tokens that signal we've passed the exercise name into set data
const EQUIPMENT_WORDS = /^(?:barbell|dumbbell|cable|machine|bodyweight|band|kettlebell|ez[- ]?bar|smith|plate|custom|pullup bar|bar)$/i;

// Day-header patterns: "PUSH DAY 1", "DAY 1: PUSH", "UPPER BODY DAY 1", etc.
const DAY_HEADER = /\b((?:PUSH|PULL|LEG[S]?|UPPER(?:\s+BODY)?|LOWER(?:\s+BODY)?|FULL\s*BODY|CHEST|BACK|SHOULDER[S]?|ARMS?|DEADLIFT|SQUAT|COMPOUND|CORRECTIVE|ACCESSORY)\s+DAY\s+\d+|DAY\s+\d+(?:\s*[:\-]\s*(?:PUSH|PULL|LEGS?|UPPER|LOWER|CHEST|BACK))?)/gi;

function detectGroupName(text: string): string {
  const candidates = [
    text.match(/([A-Z][A-Za-z /&]+(?:PROGRAM|PLAN|SPLIT|ROUTINE|PROTOCOL))/)?.[1],
    text.match(/^([A-Z][A-Z /]+)\s{2,}/)?.[1],
  ].filter(Boolean) as string[];

  const first = candidates[0]?.trim();
  if (first && first.length > 4 && first.length < 80) return first;

  if (/PUSH|PULL|LEG/i.test(text.slice(0, 300))) return "PPL Program";
  if (/UPPER|LOWER/i.test(text.slice(0, 300))) return "Upper/Lower Program";
  return "Imported Program";
}

function parseTableSection(sectionText: string): (WorkoutExercise & { name: string })[] {
  const exercises: (WorkoutExercise & { name: string })[] = [];
  const seen = new Set<string>();

  // The PDF table separates columns with 2+ spaces.
  // Split the section into "rows" by finding slot-label boundaries.
  // A row looks like: "Strength 1 (Chest)  Bench Press  Barbell  Bar/15  40%/10  60%/8"
  //
  // Strategy: split on 2+ spaces, then group tokens into logical rows
  // by detecting when a token matches a slot label.

  const tokens = sectionText.split(/\s{2,}/).map(t => t.trim()).filter(Boolean);

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    // Is this token a slot label?
    if (SLOT_REGEX.test(tok)) {
      // Next token should be the exercise name
      const exerciseName = tokens[i + 1]?.trim();
      if (!exerciseName || exerciseName.length < 3 || EQUIPMENT_WORDS.test(exerciseName)) {
        i++;
        continue;
      }

      // Skip if it looks like a set value or equipment
      if (/^[\d\-%\/]+$/.test(exerciseName) || EQUIPMENT_WORDS.test(exerciseName)) {
        i++;
        continue;
      }

      // Count set columns (tokens after slot+name+equipment that look like set values)
      // "Barbell  Bar/15  40%/10  60%/8  80%/6  100%/max" → 5 sets
      let j = i + 2; // skip slot and name
      if (j < tokens.length && EQUIPMENT_WORDS.test(tokens[j])) j++; // skip equipment
      let sets = 0;
      let repCount = 10;
      while (j < tokens.length && isSetValue(tokens[j])) {
        if (tokens[j] !== "-") {
          if (sets === 0) repCount = extractReps(tokens[j]);
          sets++;
        }
        j++;
      }
      sets = Math.max(sets, 2);

      const key = exerciseName.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        exercises.push({
          exerciseId: `imported-${slugify(exerciseName)}`,
          name: exerciseName,
          sets,
          reps: repCount,
          weight: 0,
        });
      }
      i = j;
    } else {
      i++;
    }
  }

  return exercises;
}

function isSetValue(tok: string): boolean {
  // Set values look like: "12-15", "40%/10", "Bar/15", "100%/max", "-", "3 rolls", "5"
  return /^(?:-|\d+[-–]\d+s?|\d+%\/(?:max|\d+)|Bar\/\d+|[\d.]+(?:s| rolls?)?|\d+)$/i.test(tok);
}

function extractReps(scheme: string): number {
  const range = scheme.match(/(\d+)[-–]\d+/);
  if (range) return parseInt(range[1]);
  const pctSlash = scheme.match(/\d+%\/(\d+)/);
  if (pctSlash) return parseInt(pctSlash[1]);
  const barSlash = scheme.match(/Bar\/(\d+)/i);
  if (barSlash) return parseInt(barSlash[1]);
  const plain = scheme.match(/^(\d+)$/);
  if (plain) return Math.min(parseInt(plain[1]), 30);
  return 10;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatDayName(raw: string): string {
  return raw
    .replace(/\b(\w)(\w+)/g, (_, first, rest) => first.toUpperCase() + rest.toLowerCase())
    .trim();
}

function parsePdfToWorkouts(text: string): Workout[] {
  const workouts: Workout[] = [];
  const groupName = detectGroupName(text);

  const matches = [...text.matchAll(DAY_HEADER)];
  if (matches.length === 0) return [];

  const sections: { name: string; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    sections.push({ name: m[0].trim(), text: text.slice(start, end) });
  }

  for (const section of sections) {
    const exercises = parseTableSection(section.text);
    if (exercises.length === 0) continue;

    workouts.push({
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: formatDayName(section.name),
      groupName,
      exercises,
    });
  }

  return workouts;
}

// ─── Route ──────────────────────────────────────────────────────────────────

router.post("/import/pdf", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  try {
    const buffer = fs.readFileSync(req.file.path);
    const text = await extractPdfText(buffer);
    const workouts = parsePdfToWorkouts(text);

    if (workouts.length === 0) {
      res.status(422).json({
        error: "No workout days detected. Make sure the PDF has headers like 'Push Day 1' or 'Day 1: Chest'.",
        rawTextPreview: text.slice(0, 800),
      });
      return;
    }

    res.json({ workouts });
  } catch (err) {
    res.status(500).json({
      error: "Failed to parse PDF: " + (err instanceof Error ? err.message : String(err)),
    });
  } finally {
    try { if (req.file) fs.unlinkSync(req.file.path); } catch {}
  }
});

export default router;
