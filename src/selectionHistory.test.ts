import {
  resolveSelectionBackTargetIndex,
  resolveSelectionHistoryAction,
} from './selectionHistory';

describe('resolveSelectionHistoryAction', () => {
  it('replaces peer selections by default', () => {
    expect(resolveSelectionHistoryAction('add')).toBe('replace');
  });

  it('lets a split opt into replayable selection history', () => {
    expect(resolveSelectionHistoryAction('add', 'push')).toBe('add');
  });

  it('honours an explicit replace in a push-history split', () => {
    expect(resolveSelectionHistoryAction('replace', 'push')).toBe('replace');
  });
});

describe('resolveSelectionBackTargetIndex', () => {
  it('returns the previous pane selection for a one-step Back', () => {
    expect(resolveSelectionBackTargetIndex(3)).toBe(1);
  });

  it('supports multi-step Back navigation', () => {
    expect(resolveSelectionBackTargetIndex(4, 2)).toBe(1);
  });

  it('falls back to the outer navigator without an earlier selection', () => {
    expect(resolveSelectionBackTargetIndex(1)).toBeNull();
  });
});
