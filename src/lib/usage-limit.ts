'use client';

const STORAGE_KEY = 'pdfpro-daily-usage';
const FREE_DAILY_LIMIT = 5;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

interface UsageRecord {
  date: string; // YYYY-MM-DD
  count: number;
  firstTaskTimestamp: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadRecord(): UsageRecord {
  if (typeof window === 'undefined') {
    return { date: getToday(), count: 0, firstTaskTimestamp: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0, firstTaskTimestamp: 0 };
    const parsed = JSON.parse(raw) as UsageRecord;
    // Reset if it's a new day
    if (parsed.date !== getToday()) {
      return { date: getToday(), count: 0, firstTaskTimestamp: 0 };
    }
    return parsed;
  } catch {
    return { date: getToday(), count: 0, firstTaskTimestamp: 0 };
  }
}

function saveRecord(record: UsageRecord): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

/**
 * Get the current usage count for today.
 */
export function getDailyUsageCount(): number {
  return loadRecord().count;
}

/**
 * Get the remaining tasks for today.
 */
export function getRemainingTasks(): number {
  return Math.max(0, FREE_DAILY_LIMIT - loadRecord().count);
}

/**
 * Check if the user has reached the daily limit.
 */
export function hasReachedDailyLimit(): boolean {
  return loadRecord().count >= FREE_DAILY_LIMIT;
}

/**
 * Increment the daily usage counter. Call this when a task completes successfully.
 * Returns true if the task was counted, false if limit was already reached.
 */
export function incrementDailyUsage(): boolean {
  const record = loadRecord();
  if (record.count >= FREE_DAILY_LIMIT) return false;
  record.count += 1;
  if (record.firstTaskTimestamp === 0) {
    record.firstTaskTimestamp = Date.now();
  }
  saveRecord(record);
  return true;
}

/**
 * Get the time remaining until the daily limit resets (in ms).
 */
export function getTimeUntilReset(): number {
  const record = loadRecord();
  if (record.firstTaskTimestamp === 0) return 0;
  const resetTime = record.firstTaskTimestamp + TWENTY_FOUR_HOURS;
  return Math.max(0, resetTime - Date.now());
}

/**
 * Format milliseconds into a human-readable countdown (e.g., "2h 15m").
 */
export function formatResetCountdown(ms: number): string {
  if (ms <= 0) return 'Available now';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export { FREE_DAILY_LIMIT };
