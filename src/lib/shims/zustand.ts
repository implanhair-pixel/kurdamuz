'use client';

import { useSyncExternalStore } from 'react';

type SetState<T> = (partial: Partial<T> | T | ((state: T) => Partial<T> | T)) => void;
type GetState<T> = () => T;
type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;
type StoreHook<T> = {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: () => void) => () => void;
};

function buildStore<T>(initializer: StateCreator<T>): StoreHook<T> {
  const listeners = new Set<() => void>();
  let state: T;

  const getState = () => state;
  const setState: SetState<T> = (partial) => {
    const nextPartial = typeof partial === 'function' ? (partial as (state: T) => Partial<T> | T)(state) : partial;
    state = { ...state, ...nextPartial };
    listeners.forEach((listener) => listener());
  };

  state = initializer(setState, getState);

  const useStore = (<U>(selector?: (state: T) => U) =>
    useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      () => (selector ? selector(state) : state),
      () => (selector ? selector(state) : state)
    )) as StoreHook<T>;

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return useStore;
}

export function create<T>() {
  return (initializer: StateCreator<T>) => buildStore(initializer);
}
