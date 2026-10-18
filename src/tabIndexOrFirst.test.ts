import { tabIndexOrFirst, type BottomTabType } from './navigationUtils';

const tabs = [
  { path: '/registration' },
  { path: '/invoice' },
] as unknown as BottomTabType[];

describe('tabIndexOrFirst', () => {
  it.each([
    ['invoice', 1],
    ['registration', 0],
    ['approvals', 0],
    [undefined, 0],
  ])('maps tab key %s to index %i', (tabKey, expected) => {
    expect(tabIndexOrFirst(tabs, tabKey)).toBe(expected);
  });
});
