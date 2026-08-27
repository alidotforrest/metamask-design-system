/**
 * Corner radius tokens in pixels, keyed by token name.
 *
 * The numeric steps are named after their value so a call site reads the same
 * as the Tailwind utility it mirrors: `rounded-8` and `borderRadius[8]`. The
 * two bookends are named instead, because `off` and `full` say something the
 * numbers cannot — `full` is large enough to fully round any element MetaMask
 * ships, which keeps circular and capsule shapes off the numeric ladder.
 *
 * There is deliberately no step between 24 and full: anything larger than 24px
 * in product code has always been a circle or a capsule rather than a distinct
 * corner treatment.
 */
export const borderRadius = {
  off: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  24: 24,
  full: 9999,
} as const;

export type BorderRadiusToken = keyof typeof borderRadius;
