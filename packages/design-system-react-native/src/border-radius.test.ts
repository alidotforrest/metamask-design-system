import { useTailwind } from '@metamask/design-system-twrnc-preset';
import { borderRadius } from '@metamask/design-tokens';
import { renderHook } from '@testing-library/react-native';

describe('Border radius utilities', () => {
  let tw: ReturnType<typeof useTailwind>;

  beforeEach(() => {
    tw = renderHook(() => useTailwind()).result.current;
  });

  it.each(Object.entries(borderRadius))(
    'resolves rounded-%s to %ipx',
    (token, value) => {
      expect(tw.style(`rounded-${token}`)).toStrictEqual({
        borderRadius: value,
      });
    },
  );

  it('supports corner-specific variants', () => {
    expect(tw.style('rounded-t-24')).toStrictEqual({
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    });
  });

  // `full` is absent because it is a radius token in its own right, so it
  // outlives the rest of the default scale.
  it.each(['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'])(
    'still resolves the default Tailwind class rounded-%s while consumers migrate',
    (legacySize) => {
      expect(tw.style(`rounded-${legacySize}`)).toHaveProperty('borderRadius');
    },
  );
});
