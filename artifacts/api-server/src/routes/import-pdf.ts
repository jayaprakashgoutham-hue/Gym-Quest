import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
import type { Workout, WorkoutExercise } from "../types.js";

const router = Router();
const upload = multer({ dest: "/tmp/gymquest-imports/", limits: { fileSize: 20 * 1024 * 1024 } });
const require = createRequire(import.meta.url);

// ─── PDF text extraction via pdfjs-dist (Node legacy build) ─────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Use the legacy Node.js build of pdfjs-dist which supports Buffer input
  const pdfjsLib = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
    // @ts-ignore — dynamic import path
  ) as typeof import("pdfjs-dist");

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item): item is { str: string; transform: number[] } => "str" in item)
      .sort((a, b) => {
        // Sort by y (descending = top to bottom) then x (left to right)
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4];
      })
      .map((item) => item.str)
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n\n");
}

// ─── Workout structure parser ────────────────────────────────────────────────

function parsePdfToWorkouts(text: string): Workout[] {
  const workouts: Workout[] = [];

  // Split on day headers like "PUSH DAY 1", "PULL DAY 2", "LEG DAY 1"
  const dayPattern = /\b((?:PUSH|PULL|LEG[S]?|UPPER|LOWER|FULL\s*BODY|CHEST|BACK|SHOULDER[S]?|ARM[S]?)\s+DAY\s+\d+|DAY\s+\d+\s*[:\-]?\s*(?:PUSH|PULL|LEGS?|UPPER|LOWER|CHEST|BACK)?)/gi;
  const matches = [...text.matchAll(dayPattern)];

  const sections: { name: string; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    sections.push({ name: m[0].trim(), text: text.slice(start, end) });
  }

  for (const section of sections) {
    const exercises = extractExercisesFromSection(section.text);
    if (exercises.length === 0) continue;

    workouts.push({
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: formatDayName(section.name),
      groupName: detectGroupName(text),
      exercises,
    });
  }

  return workouts;
}

function extractExercisesFromSection(sectionText: string): (WorkoutExercise & { name: string })[] {
  const results: (WorkoutExercise & { name: string })[] = [];
  const seen = new Set<string>();

  // Known exercise name keywords — broad enough to catch most patterns
  const exerciseKeywords = /bench|squat|deadlift|press|curl|row|pull|push|lunge|fly|flye|raise|crunch|plank|dip|shrug|extension|pulldown|pushdown|carry|twist|hold|bridge|thrust|hack|leg|calf|wrist|skull|tricep|bicep|hammer|lat|cable|dumbbell|barbell|incline|decline|overhead|assisted|inverted|face|lateral|rear|front/i;

  // Split into tokens/words and look for exercise-like phrases
  const lines = sectionText.split(/\n+/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip header/label lines
    if (/^(slot|exercise|equipment|set\s*\d|notes?:|warmup|cooldown|component|details|morning|evening)/i.test(line)) continue;
    if (/^(pre-?activation|strength\s+\d|hypertrophy|biceps?\s+\d|triceps?\s+\d|forearm|abs?|calves?|wrist\s+extensor)/i.test(line)) continue;
    if (line.length < 4) continue;

    // Find exercise name: starts line, contains exercise keywords, stops before numbers/equipment
    const nameMatch = line.match(/^([A-Z][A-Za-z\s\-\/()&'+]+?)(?:\s{2,}|\t|(?=\s+(?:\d+[-–]|\d+%|Bar|Barbell|Dumbbell|Cable|Machine|Bodyweight|Plate|Band|EZ|Smith|Custom|Kettlebell|\d+\s*(?:reps?|sets?|kg|lbs|s\b))))/);
    if (!nameMatch) continue;

    const rawName = nameMatch[1].trim();
    // Must be at least 4 chars and contain an exercise keyword
    if (rawName.length < 4 || !exerciseKeywords.test(rawName)) continue;
    // Skip slot labels
    if (/^(Pre-?activation|Strength|Hypertrophy|Biceps|Triceps|Forearm|Abs|Calves|Wrist)/i.test(rawName)) continue;

    const key = rawName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    // Count sets: count non-empty set columns (numbers, percentages, dashes)
    const setTokens = line.match(/\b(\d+[-–]\d+s?|\d+%\/\d+|\d{1,3}\/(?:max|\d+)|(?<![A-Za-z])\d{1,2}(?!\s*(?:kg|lbs|cm|m)))\b/g) ?? [];
    const sets = Math.min(Math.max(setTokens.length || 3, 2), 5);
    const reps = extractReps(setTokens[0] ?? "10");

    results.push({
      exerciseId: `imported-${slugify(rawName)}`,
      name: rawName,
      sets,
      reps,
      weight: 0,
    });
  }

  return results;
}

function extractReps(scheme: string): number {
  if (!scheme) return 10;
  const range = scheme.match(/(\d+)[-–]\d+/);
  if (range) return parseInt(range[1]);
  const pct = scheme.match(/\d+%\/(\d+)/);
  if (pct) return parseInt(pct[1]);
  const slash = scheme.match(/(?:bar|\d+)\/(\d+)/i);
  if (slash) return parseInt(slash[1]);
  const num = scheme.match(/(\d+)/);
  if (num) return Math.min(parseInt(num[1]), 30);
  return 10;
}

function formatDayName(raw: string): string {
  return raw
    .replace(/\b(\w)(\w+)/g, (_, first, rest) => first.toUpperCase() + rest.toLowerCase())
    .trim();
}

function detectGroupName(fullText: string): string {
  const header = fullText.slice(0, 400);
  const lines = header.split(/\n/).map(l => l.trim()).filter(l => l.length > 5 && l.length < 80);
  for (const line of lines) {
    if (/program|plan|split|routine/i.test(line)) {
      return line.replace(/\s+program\s*/i, " Program").trim();
    }
  }
  if (/push|pull|leg/i.test(fullText.slice(0, 200))) return "PPL Program";
  if (/upper|lower/i.test(fullText.slice(0, 200))) return "Upper/Lower Program";
  return "Imported Program";
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
        error: "Could not detect any workout days in this PDF. Make sure it contains day headers like 'Push Day 1' or 'Day 1: Chest'.",
        rawTextPreview: text.slice(0, 500),
      });
      return;
    }

    res.json({ workouts });
  } catch (err) {
    res.status(500).json({ error: "Failed to parse PDF: " + (err instanceof Error ? err.message : String(err)) });
  } finally {
    try { if (req.file) fs.unlinkSync(req.file.path); } catch {}
  }
});

export default router;
