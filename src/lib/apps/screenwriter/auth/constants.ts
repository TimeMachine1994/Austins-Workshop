export const SESSION_COOKIE_NAME = 'screenwriter_session';

/** Total session lifetime. */
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/** Renew (slide) the session once less than this much time is left. */
export const SESSION_RENEWAL_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
