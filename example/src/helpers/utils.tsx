import { StyleSheet, useWindowDimensions } from 'react-native';

import * as React from 'react';

export const defaultStyles = StyleSheet.create({
  full: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  gutter: {
    margin: 16,
  },
  gutterTop: {
    marginTop: 16,
  },
  gutterBottom: {
    marginBottom: 16,
  },
  gutterLeft: {
    marginLeft: 16,
  },
  gutterRight: {
    marginRight: 16,
  },
  gutterHorizontal: {
    marginRight: 16,
    marginLeft: 16,
  },
});

export function getDefaultItemLayout(
  _: any[] | undefined | null,
  index: number
) {
  return {
    length: 63,
    offset: 63 * index,
    index,
  };
}

export function useBigScreen() {
  const { width } = useWindowDimensions();
  return width > 1200;
}

export function useRenderLog(name: string) {
  const id = React.useRef<number>(getRandomIntInclusive(0, 1000000));
  const currentId = id.current;
  console.log(`Render ${name} ${currentId}`);
  React.useEffect(() => {
    return () => {
      console.log(`Unmount ${name} ${currentId}`);
    };
  }, [currentId, name]);
}
function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
