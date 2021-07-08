import * as React from 'react';
import {
  Action,
  History,
  Location,
  PartialLocation,
  Path,
  State,
  To,
  parsePath,
} from 'history';

const readOnly: <T extends unknown>(obj: T) => T = (obj) => obj;

function invariant(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}

///////////////////////////////////////////////////////////////////////////////
// CONTEXT
///////////////////////////////////////////////////////////////////////////////

/**
 * A Navigator is a "location changer"; it's how you get to different locations.
 *
 * Every history instance conforms to the Navigator interface, but the
 * distinction is useful primarily when it comes to the low-level <Router> API
 * where both the location and a navigator must be provided separately in order
 * to avoid "tearing" that may occur in a suspense-enabled app if the action
 * and/or location were to be read directly from the history instance.
 */
export type Navigator = Omit<
  History,
  'action' | 'location' | 'back' | 'forward' | 'listen'
>;

const LocationContext = React.createContext<LocationContextObject>({
  pending: false,
  static: false,
});

interface LocationContextObject {
  action?: Action;
  location?: Location;
  navigator?: Navigator;
  pending: boolean;
  static: boolean;
}

LocationContext.displayName = 'Location';

const RouteContext = React.createContext<RouteContextObject>({
  outlet: null,
  params: readOnly<Params>({}),
  pathname: '',
  route: null,
});

interface RouteContextObject {
  outlet: React.ReactElement | null;
  params: Params;
  pathname: string;
  route: RouteObject | null;
}

RouteContext.displayName = 'Route';

/**
 * Renders the child route's element, if there is one.
 *
 * @see https://reactrouter.com/api/Outlet
 */
export function Outlet(): React.ReactElement | null {
  return useOutlet();
}

export interface OutletProps {}

Outlet.displayName = 'Outlet';

/**
 * Declares an element that should be rendered at a certain URL path.
 *
 * @see https://reactrouter.com/api/Route
 */
export function Route({
  element = <Outlet />,
}: RouteProps): React.ReactElement | null {
  return element;
}

export interface RouteProps {
  caseSensitive?: boolean;
  children?: React.ReactNode;
  element?: React.ReactElement | null;
  path?: string;
  preload?: RoutePreloadFunction;
}

Route.displayName = 'Route';

/**
 * Provides location context for the rest of the app.
 *
 * Note: You usually won't render a <Router> directly. Instead, you'll render a
 * router that is more specific to your environment such as a <BrowserRouter>
 * in web browsers or a <StaticRouter> for server rendering.
 *
 * @see https://reactrouter.com/api/Router
 */
export function Router({
  children = null,
  action = Action.Pop,
  location,
  navigator,
  pending = false,
  static: staticProp = false,
}: RouterProps): React.ReactElement {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You never need more than one.`
  );

  return (
    <LocationContext.Provider
      children={children}
      value={{ action, location, navigator, pending, static: staticProp }}
    />
  );
}

export interface RouterProps {
  action?: Action;
  children?: React.ReactNode;
  location: Location;
  navigator: Navigator;
  pending?: boolean;
  static?: boolean;
}

Router.displayName = 'Router';

/**
 * A container for a nested tree of <Route> elements that renders the branch
 * that best matches the current location.
 *
 * @see https://reactrouter.com/api/Routes
 */
export function Routes({
  basename = '',
  children,
}: RoutesProps): React.ReactElement | null {
  let routes = createRoutesFromChildren(children);
  return useRoutes_(routes, basename);
}

export interface RoutesProps {
  basename?: string;
  children?: React.ReactNode;
}

Routes.displayName = 'Routes';

///////////////////////////////////////////////////////////////////////////////
// HOOKS
///////////////////////////////////////////////////////////////////////////////

/**
 * Returns the full href for the given "to" value. This is useful for building
 * custom links that are also accessible and preserve right-click behavior.
 *
 * @see https://reactrouter.com/api/useHref
 */
export function useHref(to: To): string {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useHref() may be used only in the context of a <Router> component.`
  );

  let navigator = React.useContext(LocationContext).navigator as Navigator;
  let path = useResolvedPath(to);

  return navigator.createHref(path);
}

/**
 * Returns true if this component is a descendant of a <Router>.
 *
 * @see https://reactrouter.com/api/useInRouterContext
 */
export function useInRouterContext(): boolean {
  return React.useContext(LocationContext).location != null;
}

/**
 * Returns the current location object, which represents the current URL in web
 * browsers.
 *
 * Note: If you're using this it may mean you're doing some of your own
 * "routing" in your app, and we'd like to know what your use case is. We may
 * be able to provide something higher-level to better suit your needs.
 *
 * @see https://reactrouter.com/api/useLocation
 */
export function useLocation(): Location {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useLocation() may be used only in the context of a <Router> component.`
  );

  return React.useContext(LocationContext).location as Location;
}

/**
 * Returns true if the router is pending a location update.
 *
 * @see https://reactrouter.com/api/useLocationPending
 */
export function useLocationPending(): boolean {
  return React.useContext(LocationContext).pending;
}

/**
 * Returns true if the URL for the given "to" value matches the current URL.
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 *
 * @see https://reactrouter.com/api/useMatch
 */
export function useMatch(pattern: PathPattern): PathMatch | null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useMatch() may be used only in the context of a <Router> component.`
  );

  let location = useLocation() as Location;
  return matchPath(pattern, location.pathname);
}

type PathPattern =
  | string
  | { path: string; caseSensitive?: boolean; end?: boolean };

/**
 * The interface for the navigate() function returned from useNavigate().
 */
export interface NavigateFunction {
  (to: To, options?: { replace?: boolean; state?: State }): void;
  (delta: number): void;
}

/**
 * Returns an imperative method for changing the location. Used by <Link>s, but
 * may also be used by other elements to change the location.
 *
 * @see https://reactrouter.com/api/useNavigate
 */
export function useNavigate(): NavigateFunction {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`
  );

  let locationContext = React.useContext(LocationContext);
  let navigator = locationContext.navigator as Navigator;
  let pending = locationContext.pending;
  let { pathname } = React.useContext(RouteContext);

  let activeRef = React.useRef(false);
  React.useEffect(() => {
    activeRef.current = true;
  });

  let navigate: NavigateFunction = React.useCallback(
    (to: To | number, options: { replace?: boolean; state?: State } = {}) => {
      if (activeRef.current) {
        if (typeof to === 'number') {
          navigator.go(to);
        } else {
          let path = resolvePath(to, pathname);
          // If we are pending transition, use REPLACE instead of PUSH. This
          // will prevent URLs that we started navigating to but never fully
          // loaded from appearing in the history stack.
          (!!options.replace || pending ? navigator.replace : navigator.push)(
            path,
            options.state
          );
        }
      } else {
        console.log(
          false,
          `You should call navigate() in a useEffect, not when ` +
            `your component is first rendered.`
        );
      }
    },
    [navigator, pathname, pending]
  );

  return navigate;
}

/**
 * Returns the element for the child route at this level of the route
 * hierarchy. Used internally by <Outlet> to render child routes.
 *
 * @see https://reactrouter.com/api/useOutlet
 */
export function useOutlet(): React.ReactElement | null {
  return React.useContext(RouteContext).outlet;
}

/**
 * Returns an object of key/value pairs of the dynamic params from the current
 * URL that were matched by the route path.
 *
 * @see https://reactrouter.com/api/useParams
 */
export function useParams(): Params {
  return React.useContext(RouteContext).params;
}

/**
 * Resolves the pathname of the given `to` value against the current location.
 *
 * @see https://reactrouter.com/api/useResolvedPath
 */
export function useResolvedPath(to: To): Path {
  let { pathname } = React.useContext(RouteContext);
  return React.useMemo(() => resolvePath(to, pathname), [to, pathname]);
}

/**
 * Returns the element of the route that matched the current location, prepared
 * with the correct context to render the remainder of the route tree. Route
 * elements in the tree must render an <Outlet> to render their child route's
 * element.
 *
 * @see https://reactrouter.com/api/useRoutes
 */
export function useRoutes(
  partialRoutes: PartialRouteObject[],
  basename = ''
): React.ReactElement | null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );

  let routes = React.useMemo(
    () => createRoutesFromArray(partialRoutes),
    [partialRoutes]
  );

  return useRoutes_(routes, basename);
}

function useRoutes_(
  routes: RouteObject[],
  basename = ''
): React.ReactElement | null {
  let { pathname: parentPathname, params: parentParams } =
    React.useContext(RouteContext);

  basename = basename ? joinPaths([parentPathname, basename]) : parentPathname;

  let locationPreloadRef = React.useRef<Location>();
  let location = useLocation() as Location;
  let matches = React.useMemo(
    () => matchRoutes(routes, location, basename),
    [location, routes, basename]
  );

  if (!matches) {
    // TODO: Warn about nothing matching, suggest using a catch-all route.
    return null;
  }

  // Initiate preload sequence only if the location changes, otherwise state
  // updates in a parent would re-call preloads.
  if (locationPreloadRef.current !== location) {
    locationPreloadRef.current = location;
    matches.forEach(
      ({ route, params }, index) =>
        route.preload && route.preload(params, location, index)
    );
  }

  // Otherwise render an element.
  let element = matches.reduceRight((outlet, { params, pathname, route }) => {
    return (
      <RouteContext.Provider
        children={route.element}
        value={{
          outlet,
          params: readOnly<Params>({ ...parentParams, ...params }),
          pathname: joinPaths([basename, pathname]),
          route,
        }}
      />
    );
  }, null as React.ReactElement | null);

  return element;
}

///////////////////////////////////////////////////////////////////////////////
// UTILS
///////////////////////////////////////////////////////////////////////////////

/**
 * Creates a route config from an array of JavaScript objects. Used internally
 * by `useRoutes` to normalize the route config.
 *
 * @see https://reactrouter.com/api/createRoutesFromArray
 */
export function createRoutesFromArray(
  array: PartialRouteObject[]
): RouteObject[] {
  return array.map((partialRoute) => {
    let route: RouteObject = {
      path: partialRoute.path || '/',
      caseSensitive: partialRoute.caseSensitive === true,
      element: partialRoute.element || <Outlet />,
      preload: partialRoute.preload,
    };

    if (partialRoute.children) {
      route.children = createRoutesFromArray(partialRoute.children);
    }

    return route;
  });
}

/**
 * Creates a route config from a React "children" object, which is usually
 * either a `<Route>` element or an array of them. Used internally by
 * `<Routes>` to create a route config from its children.
 *
 * @see https://reactrouter.com/api/createRoutesFromChildren
 */
export function createRoutesFromChildren(
  children: React.ReactNode
): RouteObject[] {
  let routes: RouteObject[] = [];

  React.Children.forEach(children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }

    if (element.type === React.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children)
      );
      return;
    }

    let route: RouteObject = {
      path: element.props.path || '/',
      caseSensitive: element.props.caseSensitive === true,
      // Default behavior is to just render the element that was given. This
      // permits people to use any element they prefer, not just <Route> (though
      // all our official examples and docs use <Route> for clarity).
      element,
      preload: element.props.preload,
    };

    if (element.props.children) {
      let childRoutes = createRoutesFromChildren(element.props.children);
      if (childRoutes.length) {
        route.children = childRoutes;
      }
    }

    routes.push(route);
  });

  return routes;
}

/**
 * The parameters that were parsed from the URL path.
 */
export type Params = Record<string, string>;

/**
 * A route object represents a logical route, with (optionally) its child
 * routes organized in a tree-like structure.
 */
export interface RouteObject {
  caseSensitive: boolean;
  children?: RouteObject[];
  element: React.ReactNode;
  path: string;
  preload?: RoutePreloadFunction;
}

/**
 * A "partial route" object is usually supplied by the user and may omit
 * certain properties of a real route object such as `path` and `element`,
 * which have reasonable defaults.
 */
export interface PartialRouteObject {
  caseSensitive?: boolean;
  children?: PartialRouteObject[];
  element?: React.ReactNode;
  path?: string;
  preload?: RoutePreloadFunction;
}

/**
 * A function that will be called when the router is about to render the
 * associated route. This function usually kicks off a fetch or similar
 * operation that primes a local data cache for retrieval while rendering
 * later.
 */
type RoutePreloadFunction = (
  params: Params,
  location: Location,
  index: number
) => void;

/**
 * Returns a path with params interpolated.
 *
 * @see https://reactrouter.com/api/generatePath
 */
export function generatePath(path: string, params: Params = {}): string {
  return path
    .replace(/:(\w+)/g, (_, key) => {
      invariant(params[key] != null, `Missing ":${key}" param`);
      return params[key];
    })
    .replace(/\/*\*$/, (_) =>
      params['*'] == null ? '' : params['*'].replace(/^\/*/, '/')
    );
}

/**
 * Matches the given routes to a location and returns the match data.
 *
 * @see https://reactrouter.com/api/matchRoutes
 */
export function matchRoutes(
  routes: RouteObject[],
  location: string | PartialLocation,
  basename = ''
): RouteMatch[] | null {
  if (typeof location === 'string') {
    location = parsePath(location);
  }

  let pathname = location.pathname || '/';
  if (basename) {
    let base = basename.replace(/^\/*/, '/').replace(/\/+$/, '');
    if (pathname.startsWith(base)) {
      pathname = pathname === base ? '/' : pathname.slice(base.length);
    } else {
      // Pathname does not start with the basename, no match.
      return null;
    }
  }

  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);

  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    // TODO: Match on search, state too?
    matches = matchRouteBranch(branches[i], pathname);
  }

  return matches;
}

export interface RouteMatch {
  route: RouteObject;
  pathname: string;
  params: Params;
}

function flattenRoutes(
  routes: RouteObject[],
  branches: RouteBranch[] = [],
  parentPath = '',
  parentRoutes: RouteObject[] = [],
  parentIndexes: number[] = []
): RouteBranch[] {
  routes.forEach((route, index) => {
    let path = joinPaths([parentPath, route.path]);
    let allRoutes = parentRoutes.concat(route);
    let indexes = parentIndexes.concat(index);

    // Add the children before adding this route to the array so we traverse the
    // route tree depth-first and child routes appear before their parents in
    // the "flattened" version.
    if (route.children) {
      flattenRoutes(route.children, branches, path, allRoutes, indexes);
    }

    branches.push([path, allRoutes, indexes]);
  });

  return branches;
}

type RouteBranch = [string, RouteObject[], number[]];

function rankRouteBranches(branches: RouteBranch[]): void {
  let pathScores = branches.reduce<Record<string, number>>((memo, [path]) => {
    memo[path] = computeScore(path);
    return memo;
  }, {});

  // Sorting is stable in modern browsers, but we still support IE 11, so we
  // need this little helper.
  stableSort(branches, (a, b) => {
    let [aPath, , aIndexes] = a;
    let aScore = pathScores[aPath];

    let [bPath, , bIndexes] = b;
    let bScore = pathScores[bPath];

    return aScore !== bScore
      ? bScore - aScore // Higher score first
      : compareIndexes(aIndexes, bIndexes);
  });
}

const paramRe = /^:\w+$/;
const dynamicSegmentValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s: string) => s === '*';

function computeScore(path: string): number {
  let segments = path.split('/');
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }

  return segments
    .filter((s) => !isSplat(s))
    .reduce(
      (score, segment) =>
        score +
        (paramRe.test(segment)
          ? dynamicSegmentValue
          : segment === ''
          ? emptySegmentValue
          : staticSegmentValue),
      initialScore
    );
}

function compareIndexes(a: number[], b: number[]): number {
  let siblings =
    a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);

  return siblings
    ? // If two routes are siblings, we should try to match the earlier sibling
      // first. This allows people to have fine-grained control over the matching
      // behavior by simply putting routes with identical paths in the order they
      // want them tried.
      a[a.length - 1] - b[b.length - 1]
    : // Otherwise, it doesn't really make sense to rank non-siblings by index,
      // so they sort equally.
      0;
}

function stableSort(array: any[], compareItems: (a: any, b: any) => number) {
  // This copy lets us get the original index of an item so we can preserve the
  // original ordering in the case that they sort equally.
  let copy = array.slice(0);
  array.sort((a, b) => compareItems(a, b) || copy.indexOf(a) - copy.indexOf(b));
}

function matchRouteBranch(
  branch: RouteBranch,
  pathname: string
): RouteMatch[] | null {
  let routes = branch[1];
  let matchedPathname = '/';
  let matchedParams: Params = {};

  let matches: RouteMatch[] = [];
  for (let i = 0; i < routes.length; ++i) {
    let route = routes[i];
    let remainingPathname =
      matchedPathname === '/'
        ? pathname
        : pathname.slice(matchedPathname.length) || '/';
    let routeMatch = matchPath(
      {
        path: route.path,
        caseSensitive: route.caseSensitive,
        end: i === routes.length - 1,
      },
      remainingPathname
    );

    if (!routeMatch) return null;

    matchedPathname = joinPaths([matchedPathname, routeMatch.pathname]);
    matchedParams = { ...matchedParams, ...routeMatch.params };

    matches.push({
      route,
      pathname: matchedPathname,
      params: readOnly<Params>(matchedParams),
    });
  }

  return matches;
}

/**
 * Performs pattern matching on a URL pathname and returns information about
 * the match.
 *
 * @see https://reactrouter.com/api/matchPath
 */
export function matchPath(
  pattern: PathPattern,
  pathname: string
): PathMatch | null {
  if (typeof pattern === 'string') {
    pattern = { path: pattern };
  }

  let { path, caseSensitive = false, end = true } = pattern;
  let [matcher, paramNames] = compilePath(path, caseSensitive, end);
  let match = pathname.match(matcher);

  if (!match) return null;

  let matchedPathname = match[1];
  let values = match.slice(2);
  let params = paramNames.reduce((memo, paramName, index) => {
    memo[paramName] = safelyDecodeURIComponent(values[index], paramName);
    return memo;
  }, {} as Params);

  return { path, pathname: matchedPathname, params };
}

export interface PathMatch {
  path: string;
  pathname: string;
  params: Params;
}

function compilePath(
  path: string,
  caseSensitive: boolean,
  end: boolean
): [RegExp, string[]] {
  let keys: string[] = [];
  let source =
    '^(' +
    path
      .replace(/^\/*/, '/') // Make sure it has a leading /
      .replace(/\/?\*?$/, '') // Ignore trailing / and /*, we'll handle it below
      .replace(/[\\.*+^$?{}|()[\]]/g, '\\$&') // Escape special regex chars
      .replace(/:(\w+)/g, (_: string, key: string) => {
        keys.push(key);
        return '([^\\/]+)';
      }) +
    ')';

  if (path.endsWith('*')) {
    if (path.endsWith('/*')) {
      source += '\\/?'; // Don't include the / in params['*']
    }
    keys.push('*');
    source += '(.*)';
  } else if (end) {
    source += '\\/?';
  }

  if (end) source += '$';

  let flags = caseSensitive ? undefined : 'i';
  let matcher = new RegExp(source, flags);

  return [matcher, keys];
}

function safelyDecodeURIComponent(value: string, paramName: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch (error) {
    console.log(
      false,
      `The value for the URL param "${paramName}" will not be decoded because` +
        ` the string "${value}" is a malformed URL segment. This is probably` +
        ` due to a bad percent encoding (${error}).`
    );

    return value;
  }
}

/**
 * Returns a resolved path object relative to the given pathname.
 *
 * @see https://reactrouter.com/api/resolvePath
 */
export function resolvePath(to: To, fromPathname = '/'): Path {
  let {
    pathname: toPathname,
    search = '',
    hash = '',
  } = typeof to === 'string' ? parsePath(to) : to;

  let pathname = toPathname
    ? resolvePathname(
        toPathname,
        toPathname.startsWith('/') ? '/' : fromPathname
      )
    : fromPathname;

  return { pathname, search, hash };
}

const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '');
const normalizeSlashes = (path: string) => path.replace(/\/\/+/g, '/');
const joinPaths = (paths: string[]) => normalizeSlashes(paths.join('/'));
const splitPath = (path: string) => normalizeSlashes(path).split('/');

function resolvePathname(toPathname: string, fromPathname: string): string {
  let segments = splitPath(trimTrailingSlashes(fromPathname));
  let relativeSegments = splitPath(toPathname);

  relativeSegments.forEach((segment) => {
    if (segment === '..') {
      // Keep the root "" segment so the pathname starts at /
      if (segments.length > 1) segments.pop();
    } else if (segment !== '.') {
      segments.push(segment);
    }
  });

  return segments.length > 1 ? joinPaths(segments) : '/';
}
