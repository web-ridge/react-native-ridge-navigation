import { getRootPreloadScreens } from './rootPreloadPolicy';
import type { BaseScreen, Root } from './navigationUtils';

const screen = (path: string): BaseScreen =>
  ({ path, preload: jest.fn(), element: null }) as unknown as BaseScreen;

describe('getRootPreloadScreens', () => {
  const studio = screen('/studio');
  const pipeline = screen('/pipeline');
  const content = screen('/content');
  const bottomTabs = {
    type: 'bottomTabs',
    children: [studio, pipeline, content].map((child) => ({ child })),
  } as unknown as Root[string];

  it('keeps web bottom-tab preloading route-aware', () => {
    expect(getRootPreloadScreens(bottomTabs)).toEqual([]);
  });

  it('preloads every eagerly mounted native bottom-tab root', () => {
    expect(getRootPreloadScreens(bottomTabs, { includeAllTabs: true })).toEqual(
      [studio, pipeline, content]
    );
  });
});
