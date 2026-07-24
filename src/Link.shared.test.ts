import { shouldHandleWebLinkPress } from './Link.shared';

describe('shouldHandleWebLinkPress', () => {
  it.each([undefined, 0])(
    'handles an unmodified primary press with button %s',
    (button) => {
      expect(
        shouldHandleWebLinkPress({ defaultPrevented: false }, { button })
      ).toBe(true);
    }
  );

  it.each([1, 2])('ignores non-primary mouse button %s', (button) => {
    expect(
      shouldHandleWebLinkPress({ defaultPrevented: false }, { button })
    ).toBe(false);
  });

  it('ignores a prevented or modified press', () => {
    expect(
      shouldHandleWebLinkPress({ defaultPrevented: true }, { button: 0 })
    ).toBe(false);
    expect(
      shouldHandleWebLinkPress(
        { defaultPrevented: false },
        { button: 0, metaKey: true }
      )
    ).toBe(false);
  });
});
