import { shouldReplayLinkingUrl } from './linkingReplay';

describe('shouldReplayLinkingUrl', () => {
  it('replays a browser or deep-link URL the navigator does not show yet', () => {
    expect(
      shouldReplayLinkingUrl({
        isWeb: true,
        eventUrl: '/app/detail/2',
        currentHistoryUrl: '/app/detail/2',
        currentStateUrl: '/app/detail/1',
      })
    ).toBe(true);
  });

  it('skips a stale event after a newer local navigation replaced the URL', () => {
    expect(
      shouldReplayLinkingUrl({
        isWeb: true,
        eventUrl: '/app/detail/1',
        currentHistoryUrl: '/app/detail/2',
        currentStateUrl: '/app/detail/2',
      })
    ).toBe(false);
  });

  it('skips the echo of the current URL so a pending navigation is not dropped', () => {
    // replace 2 → 1 wrote /detail/1; the user already pressed to go to 2,
    // which is pending. History and state still say 1 until it resumes.
    expect(
      shouldReplayLinkingUrl({
        isWeb: true,
        eventUrl: '/app/detail/1',
        currentHistoryUrl: '/app/detail/1',
        currentStateUrl: '/app/detail/1',
      })
    ).toBe(false);
  });

  it('always replays on native', () => {
    expect(
      shouldReplayLinkingUrl({
        isWeb: false,
        eventUrl: 'app://detail/1',
        currentHistoryUrl: undefined,
        currentStateUrl: 'app://detail/1',
      })
    ).toBe(true);
  });
});
