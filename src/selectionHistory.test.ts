import { resolveSelectionHistoryAction } from './selectionHistory';

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
