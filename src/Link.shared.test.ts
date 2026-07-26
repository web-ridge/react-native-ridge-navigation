import {
  shouldHandleNativeLinkPress,
  shouldHandleWebLinkPress,
} from './Link.shared';

describe('shouldHandleNativeLinkPress', () => {
  it('handles a tap within native press tolerance', () => {
    expect(
      shouldHandleNativeLinkPress(
        { pageX: 100, pageY: 200 },
        { pageX: 108, pageY: 207 }
      )
    ).toBe(true);
  });

  it('ignores a press released after a scroll gesture', () => {
    expect(
      shouldHandleNativeLinkPress(
        { pageX: 100, pageY: 200 },
        { pageX: 145, pageY: 203 }
      )
    ).toBe(false);
  });

  it('handles accessibility activation without a press origin', () => {
    expect(shouldHandleNativeLinkPress(null, { pageX: 0, pageY: 0 })).toBe(
      true
    );
  });
});

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
