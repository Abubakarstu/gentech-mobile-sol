/**
 * The "Sell Your Phone" questionnaire — a single, framework-agnostic source of
 * truth shared by the multi-step form (client), the pricing engine and the AI
 * grading prompt. Keeping it here means a label/option only ever changes once.
 *
 * Bilingual: every user-facing string carries an English + Urdu label.
 */

import { PTA_STATUS_LABELS, PTA_STATUSES, type PtaStatus } from "@/lib/constants";

/** A single selectable option with bilingual labels. */
export interface QuestionOption<T extends string = string> {
  value: T;
  en: string;
  ur: string;
}

export const PART_OPTIONS = [
  { value: "screen", en: "Screen", ur: "اسکرین" },
  { value: "back_panel", en: "Back panel", ur: "بیک پینل" },
  { value: "battery", en: "Battery", ur: "بیٹری" },
] as const satisfies readonly QuestionOption[];

export type ReplaceablePart = (typeof PART_OPTIONS)[number]["value"];

export const DISPLAY_ISSUE_OPTIONS = [
  { value: "lines", en: "Lines", ur: "لائنیں" },
  { value: "dots", en: "Dots / dead pixels", ur: "ڈاٹس / ڈیڈ پکسلز" },
  { value: "shade", en: "Shadow / discoloration", ur: "شیڈ / رنگت کی خرابی" },
] as const satisfies readonly QuestionOption[];

export type DisplayIssue = (typeof DISPLAY_ISSUE_OPTIONS)[number]["value"];

export const WARRANTY_OPTIONS = [
  { value: "none", en: "No warranty", ur: "وارنٹی نہیں" },
  { value: "lt6", en: "Less than 6 months", ur: "6 ماہ سے کم" },
  { value: "6to12", en: "6–12 months", ur: "6 سے 12 ماہ" },
  { value: "gt12", en: "More than a year", ur: "ایک سال سے زیادہ" },
] as const satisfies readonly QuestionOption[];

export type WarrantyRemaining = (typeof WARRANTY_OPTIONS)[number]["value"];

/** Urdu labels for PTA status (English lives in lib/constants). */
export const PTA_STATUS_URDU: Record<PtaStatus, string> = {
  PTA: "پی ٹی اے اپروڈ",
  NON_PTA: "نان پی ٹی اے",
  PATCHED: "پیچڈ",
  JV: "جے وی (فیکٹری انلاکڈ)",
};

/** PTA status options, derived from the shared enum so the two never drift. */
export const PTA_OPTIONS: readonly QuestionOption<PtaStatus>[] = (
  Object.values(PTA_STATUSES) as PtaStatus[]
).map((value) => ({
  value,
  en: PTA_STATUS_LABELS[value],
  ur: PTA_STATUS_URDU[value],
}));

/** The five guided photo slots (Step 3). */
export interface PhotoSlot {
  slot: number;
  en: string;
  ur: string;
  instructionEn: string;
  instructionUr: string;
  /** Sample reference image shipped in /public. */
  sample: string;
}

export const PHOTO_SLOTS: readonly PhotoSlot[] = [
  {
    slot: 1,
    en: "Front — screen OFF",
    ur: "سامنے — اسکرین آف",
    instructionEn: "Screen OFF, held under a light so scratches are visible.",
    instructionUr: "اسکرین آف کریں، روشنی کے نیچے پکڑیں تاکہ خراشیں نظر آئیں۔",
    sample: "/samples/quote-front-off.svg",
  },
  {
    slot: 2,
    en: "Front — screen ON (white)",
    ur: "سامنے — اسکرین آن (سفید)",
    instructionEn: "Screen ON showing a plain white image to reveal spots & lines.",
    instructionUr: "اسکرین آن رکھیں اور سادہ سفید تصویر دکھائیں تاکہ دھبے اور لائنیں نظر آئیں۔",
    sample: "/samples/quote-front-on.svg",
  },
  {
    slot: 3,
    en: "Back panel",
    ur: "بیک پینل",
    instructionEn: "The full back of the phone, flat and in focus.",
    instructionUr: "فون کی مکمل پشت، سیدھی اور فوکس میں۔",
    sample: "/samples/quote-back.svg",
  },
  {
    slot: 4,
    en: "Frame edges + cameras",
    ur: "فریم کنارے + کیمرے",
    instructionEn: "Angle the frame to show edges, corners and the camera lenses.",
    instructionUr: "فریم کو زاویے سے پکڑیں تاکہ کنارے، کونے اور کیمرہ لینز نظر آئیں۔",
    sample: "/samples/quote-frame.svg",
  },
  {
    slot: 5,
    en: "About / Battery Health screenshot",
    ur: "اباؤٹ / بیٹری ہیلتھ اسکرین شاٹ",
    instructionEn: "Screenshot of About Phone (model & storage) or Battery Health.",
    instructionUr: "اباؤٹ فون (ماڈل و اسٹوریج) یا بیٹری ہیلتھ کا اسکرین شاٹ۔",
    sample: "/samples/quote-screenshot.svg",
  },
];

export const PHOTO_SLOT_COUNT = PHOTO_SLOTS.length;
