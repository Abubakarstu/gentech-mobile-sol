import "server-only";

import { env } from "@/lib/env";
import { QUOTE_GRADES, type QuoteGrade } from "@/lib/constants";
import type { QuoteAnswers, QuotePhoto } from "@/features/quotes/schemas/quote";
import { PHOTO_SLOTS } from "@/features/quotes/lib/questions";
import type { QuoteAiResult } from "@/features/quotes/types";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export interface GradeArgs {
  brand: string;
  model: string;
  storage: string;
  answers: QuoteAnswers;
  photos: QuotePhoto[];
}

/** A grader turns photos + answers into a structured AI result. Injectable for tests. */
export type Grader = (args: GradeArgs) => Promise<QuoteAiResult>;

export function isAiGradingConfigured(): boolean {
  return Boolean(env.ANTHROPIC_API_KEY);
}

/** The exact JSON contract the model must return — also documents the shape for us. */
const RESPONSE_CONTRACT = `Return ONLY minified JSON, no prose, no code fences, matching exactly:
{"grade":"A|B|C","defects":[{"photo":<1-5>,"issue":"<short>","severity":"minor|major"}],"mismatches":["answer says X but photo shows Y"],"screenshot_data":{"model":"","storage":"","battery_health":""},"retake_needed":[<photo numbers>],"confidence":<0-1>}`;

function buildPrompt(args: GradeArgs): string {
  const slotList = PHOTO_SLOTS.map((s) => `  Photo ${s.slot}: ${s.en} — ${s.instructionEn}`).join(
    "\n",
  );
  return [
    `You are a used-phone grading expert for a buy-back service in Pakistan.`,
    `The seller claims this device:`,
    `  Brand: ${args.brand}`,
    `  Model: ${args.model}`,
    `  Storage: ${args.storage}`,
    `  Seller's answers (JSON): ${JSON.stringify(args.answers)}`,
    ``,
    `You are given 5 photos in this fixed order:`,
    slotList,
    ``,
    `Grade the device A (excellent), B (good, minor wear) or C (heavy wear / faults).`,
    `List visible defects and tie each to its photo number.`,
    `List "mismatches" where the seller's answers disagree with the photos`,
    `(e.g. they said no cracks but photo 1 shows a cracked screen).`,
    `From photo 5 (the About/Battery screenshot) read back model, storage and battery health into "screenshot_data".`,
    `Put a photo number in "retake_needed" if it is too dark, blurry, cropped or does not show what was asked.`,
    `"confidence" is your overall certainty (0-1).`,
    ``,
    RESPONSE_CONTRACT,
  ].join("\n");
}

function clampGrade(value: unknown): QuoteGrade {
  return value === "A" || value === "B" || value === "C" ? value : QUOTE_GRADES.C;
}

function sanitize(raw: unknown): QuoteAiResult {
  const o = (raw ?? {}) as Record<string, unknown>;
  const defectsIn = Array.isArray(o.defects) ? o.defects : [];
  const screenshot = (o.screenshot_data ?? {}) as Record<string, unknown>;
  const retake = Array.isArray(o.retake_needed) ? o.retake_needed : [];

  return {
    grade: clampGrade(o.grade),
    defects: defectsIn
      .map((d) => {
        const e = (d ?? {}) as Record<string, unknown>;
        const photo = Number(e.photo);
        return {
          photo: Number.isFinite(photo) ? photo : 0,
          issue: String(e.issue ?? "").slice(0, 200),
          severity: e.severity === "major" ? ("major" as const) : ("minor" as const),
        };
      })
      .filter((d) => d.issue.length > 0),
    mismatches: (Array.isArray(o.mismatches) ? o.mismatches : [])
      .map((m) => String(m).slice(0, 300))
      .filter(Boolean),
    screenshot_data: {
      model: String(screenshot.model ?? ""),
      storage: String(screenshot.storage ?? ""),
      battery_health: String(screenshot.battery_health ?? ""),
    },
    retake_needed: retake
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= PHOTO_SLOTS.length),
    confidence: Math.min(1, Math.max(0, Number(o.confidence) || 0)),
  };
}

/** Pulls the first JSON object out of a model response (tolerates stray prose/fences). */
function extractJson(text: string): unknown {
  const fenced = text.replace(/```json\s*|```/gi, "");
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object in response");
  return JSON.parse(fenced.slice(start, end + 1));
}

/** Real vision call. Passes Cloudinary URLs straight to Anthropic's image blocks. */
async function gradeWithAnthropic(args: GradeArgs): Promise<QuoteAiResult> {
  const content: Array<Record<string, unknown>> = [{ type: "text", text: buildPrompt(args) }];
  // Photos in slot order, each prefixed by a label so the model maps numbers correctly.
  for (const photo of [...args.photos].sort((a, b) => a.slot - b.slot)) {
    content.push({ type: "text", text: `Photo ${photo.slot}:` });
    content.push({ type: "image", source: { type: "url", url: photo.url } });
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_VISION_MODEL ?? DEFAULT_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic grading failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");
  return sanitize(extractJson(text));
}

/**
 * Deterministic dev grader used when no API key is set — derives a plausible result
 * from the seller's own answers so the entire flow is testable without a provider.
 * It cannot "see" the photos, so it never invents mismatches or retakes.
 */
export function devGrade(args: GradeArgs): QuoteAiResult {
  const { answers } = args;
  const defects: QuoteAiResult["defects"] = [];

  for (const issue of answers.displayIssues) {
    defects.push({
      photo: 2,
      issue: `Display ${issue}`,
      severity: issue === "lines" ? "major" : "minor",
    });
  }
  for (const part of answers.partsReplaced) {
    const photo = part === "back_panel" ? 3 : part === "battery" ? 5 : 1;
    defects.push({ photo, issue: `${part.replace("_", " ")} replaced`, severity: "major" });
  }
  if (answers.cameraIssue) defects.push({ photo: 4, issue: "Camera issue", severity: "minor" });
  if (answers.waterDamage) defects.push({ photo: 4, issue: "Water damage", severity: "major" });
  if (!answers.biometricsWorking)
    defects.push({ photo: 1, issue: "Face ID / fingerprint not working", severity: "major" });

  const hasMajor = defects.some((d) => d.severity === "major");
  const grade: QuoteGrade = answers.waterDamage
    ? QUOTE_GRADES.C
    : hasMajor || defects.length > 0
      ? QUOTE_GRADES.B
      : QUOTE_GRADES.A;

  return {
    grade,
    defects,
    mismatches: [],
    screenshot_data: {
      model: args.model,
      storage: args.storage,
      battery_health:
        typeof answers.batteryHealth === "number" ? String(answers.batteryHealth) : "",
    },
    retake_needed: [],
    confidence: 0.82,
  };
}

/** Grades a device, using the real provider when configured, else the dev grader. */
export const gradeDevice: Grader = async (args) => {
  if (!isAiGradingConfigured()) return devGrade(args);
  try {
    return await gradeWithAnthropic(args);
  } catch (error) {
    console.error("[quotes] AI grading failed, falling back to dev grader:", error);
    return devGrade(args);
  }
};
