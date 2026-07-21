/**
 * PDF Workout Plan Importer
 *
 * Detects and parses the following common PDF workout formats — no AI required:
 *
 *  Format A — Structured table  (slot label | exercise | equipment | sets…)
 *             e.g. "Strength 1 (Chest)  Bench Press  Barbell  Bar/15  40%/10"
 *
 *  Format B — Bullet / numbered list
 *             e.g. "1. Bench Press – 4 sets × 8-10 reps"
 *
 *  Format C — Inline notation
 *             e.g. "Bench Press 4x8  Squat 5x5  OHP 3x10"
 *
 *  Format D — Two-column table with no slot labels
 *             e.g. "Bench Press | 4 × 8"
 *
 * Day headers recognised (case-insensitive):
 *   PUSH/PULL/LEGS/UPPER/LOWER/FULL BODY DAY N
 *   DAY N
 *   MONDAY / TUESDAY … SUNDAY
 *   WORKOUT A / B / C
 *   WEEK N DAY N
 *   Phase N / Block N
 *   A/B/C/D  (standalone single letter used as workout label)
 */

import { Router } from "express";
import multer from "multer";
import fs from "fs";
import type { Workout, WorkoutExercise } from "../types.js";

const router = Router();
const upload = multer({
  dest: "/tmp/gymquest-imports/",
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ─── PDF text extraction ─────────────────────────────────────────────────────

async function extractPdfText(buffer: Buffer): Promise<string[]> {
  const pdfjsLib = (await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  )) as typeof import("pdfjs-dist");

  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str: string; transform: number[] }>;

    // Sort top→bottom, left→right then join
    const text = items
      .sort((a, b) => {
        const dy = b.transform[5] - a.transform[5];
        if (Math.abs(dy) > 4) return dy;
        return a.transform[4] - b.transform[4];
      })
      .map((t) => t.str.trim())
      .filter(Boolean)
      .join("  ");

    pages.push(text);
  }

  return pages;
}

// ─── Day-header detection ─────────────────────────────────────────────────────

const DAY_PATTERNS = [
  // "PUSH DAY 1", "PULL DAY 2", "LEG DAY 1"
  /\b((?:PUSH|PULL|LEG[S]?|UPPER(?:\s+BODY)?|LOWER(?:\s+BODY)?|FULL[\s-]+BODY|CHEST|BACK|SHOULDERS?|ARMS?|DEADLIFT|SQUAT|COMPOUND|CORRECTIVE|ACCESSORY)\s+DAY\s+\d+)\b/gi,
  // "DAY 1", "DAY 2"
  /\b(DAY\s+\d+)\b/gi,
  // "MONDAY", "TUESDAY" etc.
  /\b(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\b/gi,
  // "WORKOUT A", "WORKOUT B", "SESSION A"
  /\b((?:WORKOUT|SESSION|TRAINING\s+DAY)\s+[A-D1-9])\b/gi,
  // "WEEK 1 DAY 2" / "WEEK 1"
  /\b(WEEK\s+\d+(?:\s+DAY\s+\d+)?)\b/gi,
  // "PHASE 1", "BLOCK 2"
  /\b((?:PHASE|BLOCK|MESOCYCLE)\s+\d+)\b/gi,
  // Standalone "A", "B", "C" as workout labels (only when surrounded by whitespace/start)
  /(?:^|\s{3,})((?:WORKOUT\s+)?[A-D])\s*(?:\n|  )/gm,
];

interface DaySection {
  name: string;
  text: string;
}

function splitIntoDays(fullText: string): DaySection[] {
  interface Span { index: number; end: number; name: string; }

  // Process patterns in priority order: more specific patterns run first.
  // Each accepted match "reserves" a span so later, less-specific patterns
  // cannot claim a sub-match inside it ("DAY 1" inside "PUSH DAY 1").
  const accepted: Span[] = [];

  for (const pat of DAY_PATTERNS) {
    pat.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pat.exec(fullText)) !== null) {
      const idx = m.index;
      const fullMatchEnd = idx + m[0].length;
      const name = (m[1] ?? m[0]).trim();

      // Skip if any part of this match overlaps an already-accepted span
      const overlaps = accepted.some(
        (a) =>
          (idx >= a.index && idx < a.end) ||   // new starts inside existing
          (fullMatchEnd > a.index && fullMatchEnd <= a.end) || // new ends inside existing
          (idx <= a.index && fullMatchEnd >= a.end)            // new contains existing
      );
      if (!overlaps) {
        accepted.push({ index: idx, end: fullMatchEnd, name });
      }
    }
  }

  if (accepted.length === 0) return [];

  // Sort by position in text
  accepted.sort((a, b) => a.index - b.index);

  const sections: DaySection[] = [];
  for (let i = 0; i < accepted.length; i++) {
    const start = accepted[i].end; // content begins after the header
    const end = i + 1 < accepted.length ? accepted[i + 1].index : fullText.length;
    const sectionText = fullText.slice(start, end);
    if (sectionText.trim().length > 10) {
      sections.push({ name: accepted[i].name, text: sectionText });
    }
  }

  return sections;
}

// ─── Exercise-name word list ──────────────────────────────────────────────────

const EXERCISE_KEYWORDS =
  /bench|squat|deadlift|press|curl|row|pull|push|lunge|fly|flye|raise|crunch|plank|dip|shrug|extension|pulldown|pushdown|carry|twist|hold|bridge|thrust|hack|leg|calf|wrist|skull|tricep|bicep|hammer|lat|cable|dumbbell|barbell|incline|decline|overhead|assisted|inverted|face|lateral|rear|front|close|wide|sumo|stiff|good\s*morning|rdl|sldl|rdl|goblet|zercher|pin|paused|tempo|deficit|touch|band|belt|banded|hip|glute|quad|hamstring|abduct|adduct|pec|delt|trap|rhomboid|serratus|ab|oblique|plyo|box|jump|step|split|nordic|reverse|single|one-arm|two-arm|chest|back|shoulder|arm|forearm|grip|wrist|ankle|tibialis|seated|standing|lying|incline|flat|decline|cable|machine|free|weight|kettlebell|ez|smith/i;

// Slot label prefixes (table format)
const SLOT_LABEL =
  /^(?:Pre-?activation|Strength\s*\d*(?:\s*\([^)]+\))?|Hypertrophy\s*\d*(?:\s*\([^)]+\))?|Accessory\s*\d*|Mobility\s*\d*|Cooldown\s*\d*|Warmup?\s*\d*|Power\s*\d*|Biceps?\s*\d*|Triceps?\s*\d*|Forearm[s]?\/?Grip|Calves?\s*\d*|Abs?\s*\d*|Core\s*\d*|Cardio\s*\d*|Slot\s*\d+|Main\s*\d*|Finisher\s*\d*)\b/i;

// Equipment words that appear in column 3 of table format
const EQUIPMENT_WORD =
  /^(?:barbell|dumbbell|cable|machine|bodyweight|band|kettlebell|ez[- ]?bar|smith|plate|custom|pullup bar|bar|rings|trx|suspension|resistance|med ball|medicine ball|foam roller)$/i;

// Set-value tokens: "12-15", "40%/10", "Bar/15", "100%/max", "-", "5", "3 rolls", "failure"
const SET_VALUE =
  /^(?:-|failure|max|\d+[-–x×]\d+s?|\d+%\/(?:max|\d+)|Bar\/\d+|[\d.]+(?:s| rolls?)?|\d+)$/i;

// ─── Format A: structured table (slot | exercise | equipment | sets…) ─────────

function parseTableFormat(text: string): (WorkoutExercise & { name: string })[] {
  const exercises: (WorkoutExercise & { name: string })[] = [];
  const seen = new Set<string>();
  const tokens = text.split(/\s{2,}/).map((t) => t.trim()).filter(Boolean);

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (SLOT_LABEL.test(tok)) {
      const exerciseName = tokens[i + 1]?.trim() ?? "";
      if (exerciseName.length < 3 || EQUIPMENT_WORD.test(exerciseName) || SET_VALUE.test(exerciseName)) {
        i++;
        continue;
      }

      let j = i + 2;
      if (j < tokens.length && EQUIPMENT_WORD.test(tokens[j])) j++; // skip equipment col

      let sets = 0;
      let firstReps = 10;
      while (j < tokens.length && SET_VALUE.test(tokens[j])) {
        if (tokens[j] !== "-" && !/^failure$/i.test(tokens[j])) {
          if (sets === 0) firstReps = parseReps(tokens[j]);
          sets++;
        }
        j++;
      }
      sets = Math.max(sets, 2);

      const key = exerciseName.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        exercises.push({
          exerciseId: slugify(exerciseName),
          name: exerciseName,
          sets,
          reps: firstReps,
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

// ─── Format B: bullet / numbered list ────────────────────────────────────────
// Lines like:  "1. Bench Press – 4 sets × 8-10 reps"
//              "• Squat  3x5"
//              "- OHP: 4 sets of 8"
//              "Incline DB Press  3 × 10-12"

const BULLET_LINE =
  /^(?:\d+[.)]\s*|[•\-\*]\s*|[a-z][.)]\s*)?(.+?)(?:\s*[-–:]\s*|\s{2,})((?:\d+\s*[x×]\s*\d+[-–]?\d*|\d+\s*sets?\s*(?:of|×|x)?\s*\d+[-–]?\d*(?:\s*reps?)?|\d+[-–]\d+\s*(?:sets?|reps?|x|×)).*)?$/i;

function parseListFormat(text: string): (WorkoutExercise & { name: string })[] {
  const exercises: (WorkoutExercise & { name: string })[] = [];
  const seen = new Set<string>();

  // Split into lines (the text uses double-space as separator from PDF extraction)
  const lines = text.split(/(?:\n|  {2,})/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip obvious headers / labels
    if (/^(?:exercise|equipment|slot|set\s*\d|component|details|notes?|warmup|cooldown|day|week|phase|block|program|plan|split|routine)\b/i.test(line)) continue;
    if (line.length < 4 || line.length > 120) continue;

    // Try to split into name + scheme
    const m = BULLET_LINE.exec(line);
    if (!m) continue;

    const rawName = m[1]?.trim() ?? "";
    const scheme = m[2]?.trim() ?? "";

    if (!rawName || rawName.length < 3) continue;
    if (!EXERCISE_KEYWORDS.test(rawName)) continue;
    if (SLOT_LABEL.test(rawName)) continue;
    if (EQUIPMENT_WORD.test(rawName)) continue;

    const { sets, reps } = parseScheme(scheme);
    const key = rawName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      exercises.push({ exerciseId: slugify(rawName), name: rawName, sets, reps, weight: 0 });
    }
  }
  return exercises;
}

// ─── Format C: inline "Exercise Nx M" notation ───────────────────────────────
// Handles concatenated text like "Bench Press 4x8  Squat 5x5  OHP 3x10"

const INLINE_EX = /([A-Z][A-Za-z\s\-'\/()]+?)\s+(\d+\s*[x×]\s*\d+[-–]?\d*)/g;

function parseInlineFormat(text: string): (WorkoutExercise & { name: string })[] {
  const exercises: (WorkoutExercise & { name: string })[] = [];
  const seen = new Set<string>();

  let m: RegExpExecArray | null;
  INLINE_EX.lastIndex = 0;
  while ((m = INLINE_EX.exec(text)) !== null) {
    const rawName = m[1].trim();
    if (!rawName || rawName.length < 3) continue;
    if (!EXERCISE_KEYWORDS.test(rawName)) continue;
    if (SLOT_LABEL.test(rawName)) continue;

    const { sets, reps } = parseScheme(m[2]);
    const key = rawName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      exercises.push({ exerciseId: slugify(rawName), name: rawName, sets, reps, weight: 0 });
    }
  }
  return exercises;
}

// ─── Scheme / rep / set parsing ──────────────────────────────────────────────

function parseScheme(scheme: string): { sets: number; reps: number } {
  if (!scheme) return { sets: 3, reps: 10 };

  // "4x8", "4×8", "4 x 8-10"
  const xForm = scheme.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (xForm) return { sets: clampSets(+xForm[1]), reps: clampReps(+xForm[2]) };

  // "4 sets of 8", "4 sets × 8"
  const setOf = scheme.match(/(\d+)\s*sets?\s*(?:of|×|x)?\s*(\d+)/i);
  if (setOf) return { sets: clampSets(+setOf[1]), reps: clampReps(+setOf[2]) };

  // "8-12 reps" or "8-12" alone
  const repsRange = scheme.match(/(\d+)[-–]\d+\s*(?:reps?)?/i);
  if (repsRange) return { sets: 3, reps: clampReps(+repsRange[1]) };

  // bare numbers: treat first as sets if ≤6, second as reps
  const nums = scheme.match(/\d+/g);
  if (nums && nums.length >= 2) return { sets: clampSets(+nums[0]), reps: clampReps(+nums[1]) };
  if (nums) return { sets: 3, reps: clampReps(+nums[0]) };

  return { sets: 3, reps: 10 };
}

function parseReps(token: string): number {
  const range = token.match(/(\d+)[-–]\d+/);
  if (range) return clampReps(+range[1]);
  const pct = token.match(/\d+%\/(\d+)/);
  if (pct) return clampReps(+pct[1]);
  const bar = token.match(/Bar\/(\d+)/i);
  if (bar) return clampReps(+bar[1]);
  const n = token.match(/^(\d+)$/);
  if (n) return clampReps(+n[1]);
  return 10;
}

function clampSets(n: number) { return Math.min(Math.max(n, 1), 10); }
function clampReps(n: number) { return Math.min(Math.max(n, 1), 50); }

// ─── Best-effort exercise extraction for a section ───────────────────────────

function extractExercises(sectionText: string): (WorkoutExercise & { name: string })[] {
  const tableResult = parseTableFormat(sectionText);
  if (tableResult.length >= 2) return tableResult;

  const listResult = parseListFormat(sectionText);
  if (listResult.length >= 2) return listResult;

  const inlineResult = parseInlineFormat(sectionText);
  if (inlineResult.length >= 2) return inlineResult;

  // Return whichever found the most, even if < 2
  const best = [tableResult, listResult, inlineResult].sort((a, b) => b.length - a.length)[0];
  return best;
}

// ─── Program name detection ───────────────────────────────────────────────────

function detectGroupName(allText: string): string {
  const head = allText.slice(0, 500);

  // Explicit "... PROGRAM", "... PLAN", "... SPLIT" in heading
  const titled = head.match(/([A-Z][A-Za-z /&+\-]+(?:\s+(?:PROGRAM|PLAN|SPLIT|ROUTINE|PROTOCOL|METHOD|SYSTEM)))/);
  if (titled) return titled[1].trim();

  // Shorthand labels
  if (/PPL|PUSH[\s/]PULL[\s/]LEG/i.test(head)) return "PPL Program";
  if (/\bUL\b|UPPER[\s/]LOWER/i.test(head)) return "Upper/Lower Program";
  if (/5\/3\/1/i.test(head)) return "5/3/1 Program";
  if (/STARTING STRENGTH/i.test(head)) return "Starting Strength";
  if (/GREYSKULL/i.test(head)) return "Greyskull LP";
  if (/NSUNS?/i.test(head)) return "nSuns Program";
  if (/PHUL/i.test(head)) return "PHUL Program";
  if (/PHAT/i.test(head)) return "PHAT Program";
  if (/GZCLP|GZCL/i.test(head)) return "GZCLP Program";
  if (/TEXAS METHOD/i.test(head)) return "Texas Method";
  if (/MADCOW/i.test(head)) return "Madcow 5x5";
  if (/STRONGLIFT/i.test(head)) return "StrongLifts 5x5";
  if (/BPAK|BROGAIN/i.test(head)) return "Bro Program";

  // First readable line ≥ 10 chars that looks like a title
  const lines = head.split(/\s{3,}|\n/).map((l) => l.trim());
  for (const line of lines) {
    if (line.length >= 8 && line.length <= 70 && /[A-Za-z]{4,}/.test(line) && !/^(?:by |page |\d+$)/i.test(line)) {
      return line;
    }
  }

  return "Imported Program";
}

// ─── Day name formatting ──────────────────────────────────────────────────────

function formatDayName(raw: string): string {
  // "PUSH DAY 1" → "Push Day 1"
  return raw
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ─── Slug ────────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return "imported-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Main parser ─────────────────────────────────────────────────────────────

function parsePdfToWorkouts(pages: string[]): Workout[] {
  const fullText = pages.join("  ");
  const groupName = detectGroupName(fullText);

  const sections = splitIntoDays(fullText);
  if (sections.length === 0) return [];

  const workouts: Workout[] = [];

  for (const section of sections) {
    const exercises = extractExercises(section.text);
    if (exercises.length === 0) continue;

    workouts.push({
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: formatDayName(section.name),
      groupName,
      exercises: exercises.map(({ exerciseId, name, sets, reps, weight }) => ({
        exerciseId,
        name,
        sets,
        reps,
        weight,
      })),
    });
  }

  return workouts;
}

// ─── Route ───────────────────────────────────────────────────────────────────

router.post("/import/pdf", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  try {
    const buffer = fs.readFileSync(req.file.path);
    const pages = await extractPdfText(buffer);
    const workouts = parsePdfToWorkouts(pages);

    if (workouts.length === 0) {
      res.status(422).json({
        error:
          "Couldn't detect workout days in this PDF. Make sure the PDF has clear day headers (e.g. 'Push Day 1', 'Day 1', 'Monday', 'Workout A') and exercise names.",
        hint: "Supported formats: structured tables, bullet lists, numbered lists, and inline 'Exercise NxM' notation.",
        rawTextPreview: pages.join(" ").slice(0, 1000),
      });
      return;
    }

    res.json({ workouts, groupName: workouts[0]?.groupName });
  } catch (err) {
    res.status(500).json({
      error:
        "Failed to parse PDF: " + (err instanceof Error ? err.message : String(err)),
    });
  } finally {
    try {
      if (req.file) fs.unlinkSync(req.file.path);
    } catch {}
  }
});

export default router;
