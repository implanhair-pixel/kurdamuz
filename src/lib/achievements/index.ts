// Achievement engine functions
export {
  evaluateAchievements,
  getUserAchievements,
  getUserAchievementDetails,
  manuallyAwardAchievement,
  revokeAchievement,
} from './engine';

// Criteria evaluation functions
export {
  evaluateCriteria,
  calculateProgress,
  estimateCompletionDate,
  validateCriteria,
  getCriteriaDescription,
  isTimeLimited,
  isCriteriaActive,
  getRemainingTime,
} from './criteria';

// Reward distribution functions
export {
  claimAchievementReward,
  distributeReward,
  validateRewardEligibility,
  getUserClaimedRewards,
  rollbackReward,
  calculateTotalRewardValue,
  getRewardStatistics,
} from './rewards';
