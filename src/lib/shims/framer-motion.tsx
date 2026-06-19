'use client';

import React from 'react';

type MotionProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  variants?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  layout?: boolean | string;
};

const createMotionComponent = <T extends React.ElementType>(Tag: T) => {
  const Component = React.forwardRef<HTMLElement, MotionProps<T>>(
    ({ initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, viewport, layout, ...props }, ref) =>
      React.createElement(Tag, { ...props, ref })
  );
  Component.displayName = `Motion.${String(Tag)}`;
  return Component;
};

export const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) => createMotionComponent(tag as keyof JSX.IntrinsicElements),
  }
) as Record<keyof JSX.IntrinsicElements, React.ForwardRefExoticComponent<any>>;

export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
