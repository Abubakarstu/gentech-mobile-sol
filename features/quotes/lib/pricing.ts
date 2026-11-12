/**
 * Pure pricing engine (Step 5). No I/O — safe to unit-test and to reuse from the
 * seed. The service layer feeds it the admin-editable inputs (base price, grade
 * multipliers, active deduction rules) plus the final AI grade and answers.
 *
 *   price      = base × gradeMultiplier − Σ deductions
 *   priceMin   = round500(price × (1 − 3%))
 *   priceMax   = round500(price × (1 + 2%))
 */

import { QUOTE_PRICING, type QuoteGrade } from "@/lib/constants";
import type { QuoteAnswers } from "@/features/quotes/schemas/quote";
import type {
  AppliedDeduction,
  DeductionRuleDto,
  GradeMultipliers,
} from "@/features/quotes/types";

/** Round to the nearest Rs 500 (never below zero). */
export function roundToNearest(value: number, step = QUOTE_PRICING.roundTo): number {
  return Math.max(0, Math.round(value / step) * step);
}

/**
 * Maps questionnaire answers to the deduction-rule keys they trigger. The actual
 * amounts live in the admin-editable `deduction_rule` table — a key with no active
 * rule simply contributes nothing, so admins can enable/disable deductions freely.
 */
export function triggeredDeductionKeys(answers: QuoteAnswers): string[] {
  const keys: string[] = [];

  if (!answers.boxAvailable) keys.push("box_missing");
  if (!answers.chargerAvailable) keys.push("charger_missing");

  for (const part of answers.partsReplaced) keys.push(`part_replaced_${part}`);
  for (const issue of answers.displayIssues) keys.push(`display_${issue}`);

  if (!answers.biometricsWorking) keys.push("biometrics_faulty");
  if (answers.cameraIssue) keys.push("camera_issue");
  if (answers.waterDamage) keys.push("water_damage");

  if (
    typeof answers.batteryHealth === "number" &&
    answers.batteryHealth < QUOTE_PRICING.batteryHealthThreshold
  ) {
    keys.push("battery_health_low");
  }

  return keys;
}

export interface PricingInput {
  basePrice: number;
  grade: QuoteGrade;
  gradeMultipliers: GradeMultipliers;
  answers: QuoteAnswers;
  rules: DeductionRuleDto[];
}

export interface PricingResult {
  gradeMultiplier: number;
  gradedPrice: number;
  deductions: AppliedDeduction[];
  totalDeductions: number;
  price: number;
  priceMin: number;
  priceMax: number;
}

export function computeQuotePricing(input: PricingInput): PricingResult {
  const { basePrice, grade, gradeMultipliers, answers, rules } = input;

  const gradeMultiplier = gradeMultipliers[grade] ?? QUOTE_PRICING.gradeMultipliers[grade];
  const gradedPrice = basePrice * gradeMultiplier;

  const rulesByKey = new Map(rules.filter((r) => r.isActive).map((r) => [r.key, r]));
  const triggered = triggeredDeductionKeys(answers);

  const deductions: AppliedDeduction[] = [];
  for (const key of triggered) {
    const rule = rulesByKey.get(key);
    if (!rule) continue;
    const amount =
      rule.amountPkr != null
        ? rule.amountPkr
        : rule.percent != null
          ? (basePrice * rule.percent) / 100
          : 0;
    if (amount <= 0) continue;
    deductions.push({ key: rule.key, label: rule.label, amount: Math.round(amount) });
  }

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const price = Math.max(0, gradedPrice - totalDeductions);

  return {
    gradeMultiplier,
    gradedPrice,
    deductions,
    totalDeductions,
    price,
    priceMin: roundToNearest(price * (1 - QUOTE_PRICING.rangeMinPct)),
    priceMax: roundToNearest(price * (1 + QUOTE_PRICING.rangeMaxPct)),
  };
}

/**
 * Applies the AI's findings to a letter grade (Step 4): any reported mismatch
 * drops the grade one step (A→B→C). Returns the effective grade used for pricing.
 */
export function applyMismatchGradePenalty(grade: QuoteGrade, mismatchCount: number): QuoteGrade {
  if (mismatchCount < QUOTE_PRICING.mismatchGradeDropThreshold) return grade;
  if (grade === "A") return "B";
  if (grade === "B") return "C";
  return "C";
}
