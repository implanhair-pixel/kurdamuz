import * as React from 'react';
type MotionProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T] & {
  initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown; variants?: unknown;
  whileHover?: unknown; whileTap?: unknown; whileInView?: unknown; viewport?: unknown; layout?: unknown; layoutId?: string;
};
type MotionProxy = { [K in keyof JSX.IntrinsicElements]: React.ForwardRefExoticComponent<MotionProps<K> & React.RefAttributes<Element>> };
export const motion: MotionProxy;
export const AnimatePresence: React.FC<{children?: React.ReactNode; mode?: string; initial?: boolean}>;
