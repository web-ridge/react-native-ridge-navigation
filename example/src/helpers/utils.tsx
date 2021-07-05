import { StyleSheet, useWindowDimensions } from 'react-native';

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
