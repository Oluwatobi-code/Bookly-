/**
 * API Quota Manager
 * Tracks Gemini API usage and provides quota status
 */

export interface QuotaStats {
  requestsToday: number;
  tokensUsedToday: number;
  lastResetTime: string;
  estimatedTokensRemaining: number;
  quotaExhausted: boolean;
}

const DAILY_TOKEN_LIMIT = 1_000_000;
const WARNING_THRESHOLD = 0.7; // 70%
const CRITICAL_THRESHOLD = 0.9; // 90%

let quotaStats: QuotaStats = {
  requestsToday: 0,
  tokensUsedToday: 0,
  lastResetTime: new Date().toISOString(),
  estimatedTokensRemaining: DAILY_TOKEN_LIMIT,
  quotaExhausted: false
};

/**
 * Track API usage
 */
export const trackApiUsage = (tokensUsed: number = 1000): void => {
  resetQuotaIfNewDay();

  quotaStats.requestsToday++;
  quotaStats.tokensUsedToday += tokensUsed;
  quotaStats.estimatedTokensRemaining = Math.max(0, DAILY_TOKEN_LIMIT - quotaStats.tokensUsedToday);

  const usagePercent = quotaStats.tokensUsedToday / DAILY_TOKEN_LIMIT;

  if (usagePercent > CRITICAL_THRESHOLD) {
    quotaStats.quotaExhausted = true;
    console.error(
      `🚨 CRITICAL: API Quota at ${Math.round(usagePercent * 100)}%! ` +
      `${quotaStats.tokensUsedToday.toLocaleString()} / ${DAILY_TOKEN_LIMIT.toLocaleString()} tokens used. ` +
      `Switching to fallback mode.`
    );
  } else if (usagePercent > WARNING_THRESHOLD) {
    console.warn(
      `⚠️ API Quota Warning: ${Math.round(usagePercent * 100)}% used ` +
      `(${quotaStats.tokensUsedToday.toLocaleString()} / ${DAILY_TOKEN_LIMIT.toLocaleString()} tokens)`
    );
  }
};

/**
 * Get current quota statistics
 */
export const getQuotaStats = (): QuotaStats => {
  resetQuotaIfNewDay();
  return { ...quotaStats };
};

/**
 * Check if quota is low (less than 20% remaining)
 */
export const isQuotaLow = (): boolean => {
  resetQuotaIfNewDay();
  return quotaStats.estimatedTokensRemaining < DAILY_TOKEN_LIMIT * 0.2;
};

/**
 * Check if quota is exhausted (over 90% used)
 */
export const isQuotaExhausted = (): boolean => {
  resetQuotaIfNewDay();
  return quotaStats.quotaExhausted;
};

/**
 * Reset quota if new day has started
 */
export const resetQuotaIfNewDay = (): void => {
  const lastReset = new Date(quotaStats.lastResetTime);
  const now = new Date();

  if (lastReset.toDateString() !== now.toDateString()) {
    quotaStats = {
      requestsToday: 0,
      tokensUsedToday: 0,
      lastResetTime: now.toISOString(),
      estimatedTokensRemaining: DAILY_TOKEN_LIMIT,
      quotaExhausted: false
    };
    console.log("✅ Daily API quota reset");
  }
};

/**
 * Get time until quota reset
 */
export const getTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const lastReset = new Date(quotaStats.lastResetTime);
  const nextReset = new Date(lastReset);
  nextReset.setDate(nextReset.getDate() + 1);

  const diff = nextReset.getTime() - new Date().getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

/**
 * Format quota stats for display
 */
export const formatQuotaStats = (): string => {
  const stats = getQuotaStats();
  const usagePercent = Math.round((stats.tokensUsedToday / DAILY_TOKEN_LIMIT) * 100);
  const { hours, minutes } = getTimeUntilReset();

  return (
    `API Quota: ${usagePercent}% used | ` +
    `${stats.tokensUsedToday.toLocaleString()} / ${DAILY_TOKEN_LIMIT.toLocaleString()} tokens | ` +
    `Reset in ${hours}h ${minutes}m`
  );
};
