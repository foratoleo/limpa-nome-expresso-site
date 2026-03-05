/**
 * Comprehensive Auth Flow Debugging Utility
 *
 * This utility creates a complete audit trail of the authentication flow
 * that can be viewed even in production by accessing sessionStorage.
 *
 * Usage in browser console:
 * console.log(JSON.parse(sessionStorage.getItem('authDebugLogs')))
 *
 * Or export logs:
 * copy(JSON.parse(sessionStorage.getItem('authDebugLogs')))
 */

export interface AuthDebugLog {
  timestamp: string;
  step: string;
  data: any;
}

const MAX_LOGS = 200; // Prevent sessionStorage overflow

export function debugAuthFlow(step: string, data: any) {
  const timestamp = new Date().toISOString();
  const logEntry: AuthDebugLog = { timestamp, step, data };

  // Console logging in development
  if (import.meta.env.DEV) {
    console.log(`[AUTH DEBUG ${timestamp}] ${step}:`, data);
  }

  // Store in sessionStorage for production debugging
  try {
    const logsJson = sessionStorage.getItem('authDebugLogs') || '[]';
    const logs: AuthDebugLog[] = JSON.parse(logsJson);

    logs.push(logEntry);

    // Keep only the most recent logs to prevent overflow
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    sessionStorage.setItem('authDebugLogs', JSON.stringify(logs));
  } catch (error) {
    // If sessionStorage is full or unavailable, just log to console
    if (import.meta.env.DEV) {
      console.error('[AUTH DEBUG] Failed to store logs in sessionStorage:', error);
    }
  }
}

/**
 * Clear all auth debug logs
 */
export function clearAuthDebugLogs() {
  sessionStorage.removeItem('authDebugLogs');
  if (import.meta.env.DEV) {
    console.log('[AUTH DEBUG] Logs cleared');
  }
}

/**
 * Export logs as JSON string
 */
export function exportAuthDebugLogs(): string {
  try {
    const logs = sessionStorage.getItem('authDebugLogs') || '[]';
    return logs;
  } catch (error) {
    console.error('[AUTH DEBUG] Failed to export logs:', error);
    return '[]';
  }
}

/**
 * Get logs as object
 */
export function getAuthDebugLogs(): AuthDebugLog[] {
  try {
    const logsJson = sessionStorage.getItem('authDebugLogs') || '[]';
    return JSON.parse(logsJson);
  } catch (error) {
    console.error('[AUTH DEBUG] Failed to get logs:', error);
    return [];
  }
}

/**
 * Pretty print logs to console
 */
export function printAuthDebugLogs() {
  const logs = getAuthDebugLogs();
  console.table(logs);
  return logs;
}

// Make functions available globally in development for easy debugging
if (import.meta.env.DEV) {
  (window as any).authDebugLogs = {
    get: getAuthDebugLogs,
    export: exportAuthDebugLogs,
    clear: clearAuthDebugLogs,
    print: printAuthDebugLogs,
  };
}
