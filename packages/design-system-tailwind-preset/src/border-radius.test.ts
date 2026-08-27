import {
  getDesignTokenVariables,
  collectCssVariables,
} from '../scripts/testUtils';

import { borderRadius } from './border-radius';

describe('Border radius', () => {
  const usedVariables = collectCssVariables(borderRadius);

  it('should use only radius CSS variables that exist in @metamask/design-tokens', async () => {
    const designTokens = await getDesignTokenVariables(['--radius']);

    const missingVariables = usedVariables.filter(
      (varName) => !designTokens.has(varName),
    );

    expect(missingVariables).toHaveLength(0);
  });

  it('should not have unused radius CSS variables in @metamask/design-tokens', async () => {
    const designTokens = await getDesignTokenVariables(['--radius']);
    const usedSet = new Set(usedVariables);

    const unusedVariables = Array.from(designTokens).filter(
      (varName) => !usedSet.has(varName),
    );

    expect(unusedVariables).toHaveLength(0);
  });

  it('exposes the full MetaMask radius scale', () => {
    expect(Object.keys(borderRadius)).toStrictEqual([
      '2',
      '4',
      '6',
      '8',
      '10',
      '12',
      '16',
      '24',
      'off',
      'full',
    ]);
  });
});
