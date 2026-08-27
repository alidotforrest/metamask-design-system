/**
 * Corner radius scale.
 *
 * Added alongside Tailwind's default `borderRadius` scale for now, so consumers
 * can adopt these tokens without a coordinated rename. The token names are
 * numeric plus `off`/`full`. Only `full` overlaps a Tailwind default name, and
 * it carries the same 9999px value. The defaults are intended to be removed
 * once consumers have migrated.
 */
export const borderRadius = {
  off: 'var(--radius-off)',
  2: 'var(--radius-2)',
  4: 'var(--radius-4)',
  6: 'var(--radius-6)',
  8: 'var(--radius-8)',
  10: 'var(--radius-10)',
  12: 'var(--radius-12)',
  16: 'var(--radius-16)',
  24: 'var(--radius-24)',
  full: 'var(--radius-full)',
};
