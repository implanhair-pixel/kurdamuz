import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  coinBalance: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysLearned: number;
  achievementsCount: number;
  completedLessons: number;
}

export interface UserStore {
  // State
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  // Actions
  setStats: (stats: Partial<UserStats>) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  incrementLessons: () => void;
  unlockAchievement: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
  resetStore: () => void;
}

const initialState: UserStats = {
  level: 1,
  currentXP: 0,
  nextLevelXP: 100,
  totalXP: 0,
  coinBalance: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalDaysLearned: 0,
  achievementsCount: 0,
  completedLessons: 0,
};

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      // Fix hydration mismatch: mark store with hasHydrated flag
      (set, get) => ({
        stats: initialState,
        isLoading: false,
        error: null,

        setStats: (newStats) =>
          set((state) => ({
            stats: { ...state.stats, ...newStats },
          })),

        addXP: (amount) =>
          set((state) => {
            let newLevel = state.stats.level;
            let newCurrentXP = state.stats.currentXP + amount;
            let newNextLevelXP = state.stats.nextLevelXP;
            let newTotalXP = state.stats.totalXP + amount;

            // Check for level up
            while (newCurrentXP >= newNextLevelXP) {
              newCurrentXP -= newNextLevelXP;
              newLevel += 1;
              newNextLevelXP = Math.floor(newNextLevelXP * 1.1); // 10% increase per level
            }

            return {
              stats: {
                ...state.stats,
                level: newLevel,
                currentXP: newCurrentXP,
                nextLevelXP: newNextLevelXP,
                totalXP: newTotalXP,
              },
            };
          }),

        addCoins: (amount) =>
          set((state) => ({
            stats: {
              ...state.stats,
              coinBalance: state.stats.coinBalance + amount,
            },
          })),

        spendCoins: (amount) =>
          set((state) => ({
            stats: {
              ...state.stats,
              coinBalance: Math.max(0, state.stats.coinBalance - amount),
            },
          })),

        incrementStreak: () =>
          set((state) => {
            const newStreak = state.stats.currentStreak + 1;
            const newLongest = Math.max(newStreak, state.stats.longestStreak);
            return {
              stats: {
                ...state.stats,
                currentStreak: newStreak,
                longestStreak: newLongest,
                totalDaysLearned: state.stats.totalDaysLearned + 1,
              },
            };
          }),

        resetStreak: () =>
          set((state) => ({
            stats: {
              ...state.stats,
              currentStreak: 0,
            },
          })),

        incrementLessons: () =>
          set((state) => ({
            stats: {
              ...state.stats,
              completedLessons: state.stats.completedLessons + 1,
            },
          })),

        unlockAchievement: () =>
          set((state) => ({
            stats: {
              ...state.stats,
              achievementsCount: state.stats.achievementsCount + 1,
            },
          })),

        hasHydrated: false,
        setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        resetStore: () =>
          set({
            stats: initialState,
            isLoading: false,
            error: null,
          }),
      }),
      {
        name: 'user-store', // localStorage key
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
          }
        },
      }
    )
  )
);
