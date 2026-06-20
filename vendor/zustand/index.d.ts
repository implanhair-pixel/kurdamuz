export type StateCreator<T> = (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T, api: any) => T;
export function create<T>(creator: StateCreator<T>): (() => T) & { getState: () => T; setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void; subscribe: (listener: () => void) => () => void };
