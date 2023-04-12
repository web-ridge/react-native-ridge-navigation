import type { BaseScreen, LinkProps } from './navigationUtils';

export function extractLinkProps<T extends BaseScreen>(
  props: Omit<LinkProps<T>, 'children'>
) {
  const {
    to,
    params,
    linkMode,
    onPress,
    skipLinkBehaviourIfPressIsDefined,
    replace,
    refresh,
    toBottomTab,
    ...otherProps
  } = props;
  return {
    to,
    params,
    linkMode,
    onPress,
    skipLinkBehaviourIfPressIsDefined,
    replace,
    refresh,
    toBottomTab,
    otherProps,
  };
}
