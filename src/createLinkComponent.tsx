import * as React from 'react';
import Link from './Link';
import type { BaseScreen, LinkProps } from './navigationUtils';
import { extractLinkProps } from './Link.shared';

export default function createLinkComponent<P extends object>(
  Component: React.ComponentType<P>
) {
  return function <LinkT extends BaseScreen>(
    props: Omit<LinkProps<LinkT>, 'children'> & {
      skipLinkBehaviourIfPressIsDefined?: boolean;
    } & React.ComponentProps<typeof Component>
  ) {
    const { otherProps, ...linkConfiguration } = extractLinkProps(props);
    return (
      <Link {...linkConfiguration}>
        {(linkProps) => <Component {...(otherProps as P)} {...linkProps} />}
      </Link>
    );
  };
}
