/**
 * API call budget tracker.
 *
 * Tracks monthly Khaya API usage in a flat JSON file (dev) or
 * environment-compatible store. Fires a console alert at the
 * configured threshold so you can upgrade tiers before hitting the cap.
 *
 * Free tier: 100 calls/month
 * Basic:   3,000 calls/month ($14.95)
 * Standard: 20,000 calls/month ($89.95)
 */

import fs from "fs";
import path from "path";

export type CallType = "translate" | "stt" | "tts" | "detect";

interface MonthBudget {
  month: string;           // "YYYY-MM"
  callsLimit: number;
  calls: Record<CallType, number>;
  cacheHits: number;
}

const BUDGET_FILE = path.join(process.cwd(), ".budget.json");
const LIMIT = parseInt(process.env.KHAYA_MONTHLY_LIMIT ?? "100", 10);
const ALERT_PCT = parseInt(process.env.BUDGET_ALERT_THRESHOLD ?? "80", 10);

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function loadBudget(): MonthBudget {
  const month = currentMonth();
  try {
    if (fs.existsSync(BUDGET_FILE)) {
      const data: MonthBudget = JSON.parse(fs.readFileSync(BUDGET_FILE, "utf8"));
      if (data.month === month) return data;
    }
  } catch {
    // corrupt file — reset
  }
  return { month, callsLimit: LIMIT, calls: { translate: 0, stt: 0, tts: 0, detect: 0 }, cacheHits: 0 };
}

function saveBudget(b: MonthBudget): void {
  try {
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(b, null, 2));
  } catch {
    // read-only FS (Vercel prod) — degrade silently
  }
}

export function recordCall(type: CallType): void {
  const b = loadBudget();
  b.calls[type] = (b.calls[type] ?? 0) + 1;

  const total = Object.values(b.calls).reduce((s, n) => s + n, 0);
  const pct = Math.round((total / b.callsLimit) * 100);

  if (pct >= ALERT_PCT) {
    console.warn(
      `[budget] ⚠️  ${pct}% of Khaya quota used (${total}/${b.callsLimit}) — consider upgrading tier`
    );
  }

  saveBudget(b);
}

export function recordCacheHit(): void {
  const b = loadBudget();
  b.cacheHits = (b.cacheHits ?? 0) + 1;
  saveBudget(b);
}

export function getBudgetStatus() {
  const b = loadBudget();
  const callsUsed = Object.values(b.calls).reduce((s, n) => s + n, 0);
  return {
    month: b.month,
    callsUsed,
    callsLimit: b.callsLimit,
    percentUsed: Math.round((callsUsed / b.callsLimit) * 100),
    cacheHits: b.cacheHits,
    callsSaved: b.cacheHits,
    breakdown: b.calls,
    alertThreshold: ALERT_PCT,
  };
}
