import { borderRadius } from '@metamask/design-tokens';

/**
 * Corner radius scale for twrnc.
 *
 * Added alongside Tailwind's default `borderRadius` scale for now, so consumers
 * can adopt these tokens without a coordinated rename. The token names are
 * numeric plus `off`/`full`. Only `full` overlaps a Tailwind default name, and it
 * carries the same 9999px value. The defaults are intended to be removed once
 * consumers have migrated.
 */
export const borderRadiusTailwindConfig = Object.fromEntries(
  Object.entries(borderRadius).map(([token, value]) => [token, `${value}px`]),
) as Record<keyof typeof borderRadius, string>;
