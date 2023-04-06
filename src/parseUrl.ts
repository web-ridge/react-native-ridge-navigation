import type { BaseScreen } from './navigationUtils';

export type MatchedRoute = {
  route: BaseScreen;
  params: { [key: string]: string };
};
export function findMatchedRoutes(
  paths: string[],
  routes: BaseScreen[]
): MatchedRoute[] {
  const matchedRoutes: MatchedRoute[] = [];

  let i = 0;
  while (i < paths.length) {
    let matched = false;

    for (const route of routes) {
      const routeParts = route.path.split('/').filter((p) => p !== '');
      if (routeParts.length <= paths.length - i) {
        const params: { [key: string]: string } = {};
        const isMatch = routeParts.every((part, index) => {
          if (part.startsWith(':')) {
            //@ts-ignore
            params[part.slice(1)] = paths[i + index];
            return true;
          }
          return part === paths[i + index];
        });

        if (isMatch) {
          matchedRoutes.push({ route, params });
          i += routeParts.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      i++;
    }
  }

  return matchedRoutes;
}
