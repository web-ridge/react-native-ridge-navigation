// Expo Linking also reports the URLs this navigator writes itself, so a
// Linking event is replayed through `openUrl` only when it still says
// something new.
//
// - A newer local navigation may already have replaced the URL during the
//   debounce window: replaying the stale event would jump the user back.
// - The navigator may already show the event's URL while a newer navigation
//   is still pending (a suspended transition only writes history once it
//   resumes). Replaying it then navigates to the current URL, which changes
//   the navigator's context and silently drops the pending navigation — on
//   web, paging Volgende → Vorige quickly left the user on the old screen.
//
// Real browser and deep-link events still point at a URL the navigator does
// not show yet, and continue through openUrl.
export function shouldReplayLinkingUrl({
  isWeb,
  eventUrl,
  currentHistoryUrl,
  currentStateUrl,
}: {
  isWeb: boolean;
  eventUrl: string;
  currentHistoryUrl: string | undefined;
  currentStateUrl: string | undefined;
}): boolean {
  if (!isWeb) {
    return true;
  }
  if (currentHistoryUrl !== eventUrl) {
    return false;
  }
  return currentStateUrl !== eventUrl;
}
