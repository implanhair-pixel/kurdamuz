// Streak tracking functions
export {
  getOrCreateUserStreak,
  recordActivity,
  hasActivityToday,
  getStreakHistory,
  isStreakAtRisk,
  getStreakStatistics,
  resetUserStreak,
  freezeUserStreak,
  unfreezeUserStreak,
} from './tracker';

// Recovery functions
export {
  createRecoveryRequest,
  getUserRecoveryRequests,
  getPendingRecoveryRequests,
  processRecoveryRequest,
  checkRecoveryEligibility,
  getRecoveryStatistics,
} from './recovery';

// Validation functions
export {
  isValidActivityType,
  isValidStreakStatusTransition,
  isValidRecoveryType,
  isValidRecoveryStatusTransition,
  isRecoveryCooldownActive,
  validateStreakDataIntegrity,
  validateRecoveryRequestData,
  qualifiesForAutomaticRecovery,
  isWithinEngagementWindow,
  getStreakHealthStatus,
} from './validation';
