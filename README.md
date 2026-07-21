<h1 align="center">
  <img src="https://user-images.githubusercontent.com/6492229/124349256-854c4680-dbee-11eb-84ca-fd410a4a0fcd.png" width="128">
  <br>
  react-native-ridge-navigation
</h1>

Simple and performant navigation on iOS, Android and the web with simple and type-safe api.

Build on top of [grahammendick/navigation](https://github.com/grahammendick/navigation). Check it out if you want more
control over the navigation!



## Features

- New architecture
- Simple api
- 100% Type safety (routes, params, bottom tabs)
- Bundle splitting (lazy loading, smart prefetching)
- Render as you fetch on iOS, Android & web
- Works on Android, iOS & web!
- Preload data on mouseDown (or more sensitive on hover, see `<Link />` example)
- Preload component on hover (on web)
- Automatic deep-linking
- Real-time light/dark mode
- Out of the box scroll restoration (on web), because screens in tab are pushed on top of each other!
- A lot of control over the web layout
- Universal links (already works, but docs need work)
- PWA documentation (already works, but docs need work)
- Expo support
- Metro bundling on web


## Expo
If you use bundling with metro add this to your index.js file
```tsx
import '@expo/metro-runtime';
```
Customize index.html by pressing space on the web/index.html item + enter
```shell
npx expo  customize:web

```
Change in your index.html in body css
```overflow-y:hidden``` to ```overflow: hidden```
Because otherwise scrolling works very bad on iOS safari.

## Example

[![Demo of react-native-ridge-navigation](https://drive.google.com/uc?id=1nE0DzlaVza_h3K1KCkPnK5NfIXfYM5c-)](https://www.youtube.com/watch?v=EvNxrRIF7C0)
This is an older video which used react-native-navigation so we have newer material you bottom bar in the meantime :)
View video in better frame [on YouTube](https://www.youtube.com/watch?v=EvNxrRIF7C0)

## About us

We want developers to be able to build software faster using modern tools like GraphQL, Golang and React Native.

Give us a follow on Twitter:
[RichardLindhout](https://twitter.com/RichardLindhout),
[web_ridge](https://twitter.com/web_ridge)

### Demo

[See example: reactnativeridgenavigation.com](https://www.reactnativeridgenavigation.com/)

### Source

[See source of example app](https://github.com/web-ridge/react-native-ridge-navigation/tree/main/example)

### Register screens

You can register screens with a preload function, the params will be automatically in string format based on the url.

```tsx
// NavigatorRoutes.ts
const PostScreen = registerScreen(
  '/post/:id',
  lazy(() => import('./PostScreen'),
  ({ id }) => {
    queryClient.prefetchQuery(
      queryKeyPostScreen({ id }),
      queryKeyPostScreenPromise({ id }),
      { staleTime: 3000 }
    );

    // if you return something here it can be used in the screen itself or somewhere else with
    // usePreloadResult(routes.PostScreen)
    // in this case react-query handles it based on queryKey so it's not needed but with Relay.dev it is.
    // you can put the result of the usePreloadResult in your usePreloadedQuery if you use Relay.dev

  }
);

const routes = {
  PostScreen,
  // ...
}
export default routes
```

## Supported stacks

- normal
- bottomTabs

every screen can be used within every stack. You don't have to configure screens for a stack.

## Installation

#### 1. If you don't have an app yet (optional, but recommended)

Use Expo with prebuild (Expo Go is not supported since we have native libraries)

#### 2. Install deps + library

```
yarn add react-native-ridge-navigation navigation-react-native
```

or with npm

```
npm install react-native-ridge-navigation navigation-react-native
```


Support for Material You bottom bar in Android

#### 1. add file `expo-plugin-android-material-you-bottom-bar.js` to your root folder

```js
const { withAndroidStyles } = require("@expo/config-plugins");

module.exports = function androidMaterialYouBottomBarPlugin(config) {
  return withAndroidStyles(config, async (config) => {
    const styleFile = config.modResults;
    const appTheme = styleFile.resources.style.find(
      (style) => style.$.name === 'AppTheme',
    );
    appTheme.$.parent = 'Theme.Material3.DayNight.NoActionBar';

    return config;
  });
};
```

#### 2. add this to your expo config app.config.js or app.json

```json
"plugins": [
"./expo-plugin-android-material-you-bottom-bar"
]
```

## Usage

NavigationRoots.tsx
```tsx


const NavigationRoots = {
  RootHome: 'home',
  RootAuth: 'auth',
};
export default NavigationRoots;
```

BottomRoots.tsx
```ts
// svg to png
// https://webkul.github.io/myscale/
//
// tab icon
// http://nsimage.brosteins.com/Home
const BottomRoots = {
  Posts: {
    path: '/post',
    title: () => 'Posts',
    icon: require('./img/palette-swatch-outline/icon-20.png'),
    selectedIcon: require('./img/palette-swatch/icon-20.png'),
    child: routes.PostsScreen,
  },
  Account: {
    path: '/account',
    title: () => 'Account',
    icon: require('./img/account-circle-outline/icon-20.png'),
    selectedIcon: require('./img/account-circle/icon-20.png'),
    child: routes.AccountScreen,
  },
};
export default BottomRoots;
```

```tsx
// App.tsx
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncBoundary from './helpers/AsyncBoundary';
import {
  createBottomTabsRoot,
  createNormalRoot,
  NavigationProvider,
} from 'react-native-ridge-navigation';

import { BottomRoot, NavigationRoots, screens } from './Navigator';
import routes from './Routes';
import AsyncBoundaryScreen from './helpers/AsyncBoundaryScreen';

const navigationRoot = {
  [NavigationRoots.RootHome]: createBottomTabsRoot(
    [BottomRoot.Home, BottomRoot.Posts, BottomRoot.Account],
    // if you want to override web layout
    // {
    //   breakingPointWidth: 500,
    //   components: {
    //     override: WebLayout,
    //   },
    // }
  ),
  [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationProvider
        screens={screens}
        SuspenseContainer={AsyncBoundaryScreen}
        navigationRoot={navigationRoot}
      />
    </SafeAreaProvider>
  );
}

```

See example code for the async-boundary stuff :)

## New screen

Use the `<Link />` component as much as possible since it will work with ctrl+click on the web :)

```tsx
<Link
  to={routes.PostScreen}
  params={{ id: `${item.id}` }}
  // linkMode="default" // optional if sensitive the preload will be called on hover instead of mouseDown
>
  {(linkProps) => (
    <Pressable  {...linkProps}> // or other touchables/buttons
      <Text>go to post</Text>
    </Pressable>
  )}
</Link>



```

## createLinkComponent

Use the `createLinkComponent` component to create re-usable links without render props. E.g to create a linkable button
for react-native-paper

```tsx
//ButtonLink.tsx
import { Button } from 'react-native-paper';
import { createLinkComponent } from 'react-native-ridge-navigation';

const ButtonLink = createLinkComponent(Button);
export default ButtonLink;
```

```tsx
<ButtonLink
  to={routes.PostScreen}
  params={{ id: '2' }}
  mode="contained"
  // all optional RNP props
  // all optional Link props
>
  Go further
</ButtonLink>
```

Alternatives (push, replace, refresh or fluent)

```tsx
const { push, replace, refresh, fluent } = useNavigation();

// call this where if you can't use <Link />
push(routes.PostScreen, {
  id: `${item.id}`
});

// call this if e.g. after a create you want to go to edit screen
// but without pushing history to the url-stack or app-stack :)
replace(routes.PostScreen, {
  id: `${item.id}`
});

// call this if you want to refresh the screen with new params
refresh(routes.PostScreen, {
  id: `${item.id}`
});

// normal root, replace full history
fluent(
  fluentRootNormal(NavigationRoots.RootAuth),
  fluentScreen(Routes.HomeScreen, {}),
  fluentScreen(Routes.PostScreen, { id: '10' }),
  fluentScreen(Routes.PostScreen, { id: '20' }),
  fluentScreen(Routes.PostScreen, { id: '30' })
);

// bottom root, replace full history
fluent(
  fluentRootBottomTabs(NavigationRoots.RootHome, BottomRoot.Account),
  fluentScreen(Routes.HomeScreen, {}),
  fluentScreen(Routes.PostScreen, { id: '10' }),
  fluentScreen(Routes.PostScreen, { id: '20' }),
  fluentScreen(Routes.PostScreen, { id: '30' })
);
```

## Switch root

Switch root can be used to switch from e.g. the auth screen to a different entrypoint of your app. E.g. check the role
and switch the stacks to different roots for different user roles.

```tsx
<SwitchRoot rootKey={NavigationRoots.RootHome} params={{}} />;
// or e.g.
<SwitchRoot rootKey={NavigationRoots.RootAuth} params={{}} />;
```

## useNavigation

All available properties

```tsx
const {
  pop, // go back
  switchRoot,
  preload, // call preload (done automatic on link mouseDown
  push, // calls preload + pushes screen
  replace, // calls preload + replaces screen
  refresh, // calls preload + replaces params of screen
} = useNavigation()
```

## Control bottom tabs

```tsx
  const { switchToTab, currentTab } = useBottomTabIndex();
const { updateBadge, badges } = useBottomTabBadges();
// updateBadge(BottomRoots.Projects, '10');
// switchToTab(BottomRoot.Posts);
```

## Modal stack

If you want a nested stack e.g. in a modal, check out
the [example code](https://github.com/web-ridge/react-native-ridge-navigation/blob/main/example/src/Account/AccountScreen.tsx)
.

```tsx
import {
  NavigationNestedProvider,
  ModalBackHandler,
} from 'react-native-ridge-navigation';

<ModalBackHandler>
  {(handleBack) => (
    <Modal
      visible={modalVisible}
      style={{ backgroundColor: theme.colors.background }}
      statusBarTranslucent={true}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={() => {
        if (!handleBack()) setModalVisible(false);
      }}
    >
      <NavigationNestedProvider>
        {/* you can render your children here and push to all registered screens*/}
        <View style={{ height: 250, backgroundColor: 'pink' }}>
          <Header title="Modal stack" />
          <Button onPress={onClose}>Close modal</Button>
          <Link to={routes.PostScreen} params={{ id: '2' }}>
            {(linkProps) => <Button {...linkProps}>Account</Button>}
          </Link>
        </View>
      </NavigationNestedProvider>
    </Modal>
  )}
</ModalBackHandler>
```

## Deep linking

You have to enable url schemes etc in your app and it'll work!

If you want to deep link into a bottom tab or other screen you can use the fluent navigation in development mode and it will log the required url to go to the right screen :)

## More

```ts
  // global
  createLinkComponent,
  SwitchRoot,
  BottomTabLink,
  Link
  BackLink // for now .pop() but we'll update this according to Android guidelines later on (to always go back in hierarchy)
  lazyWithPreload // only available on the web: see example app
  Redirect,
  NavigationRoot,
  createNavigation,
  createBottomTabsRoot,
  createNormalRoot,
  registerScreen,
  createScreens,
  defaultTheme,
  setTheme,
  getTheme,
  createSimpleTheme,
  setPreloadResult, // should not need this as it is done automatically

  // common hooks
  useParams,
  useNavigation,


  // extra
  useBottomTabIndex,
  useBottomTabBadges,
  useBottomTabRefresh,
  useTheme,
  useIsFocused,
  useFocus,// same as useNavigating
  useNavigating,
  useNavigated,
  useUnloaded,
  usePreloadResult // e.g. usePreloadResult(routes.PostScreen)
```

## Do global stuff like updating badge

If you want to use a component globally with the navigation context pass them as children of the NavigationProvider

```tsx
<NavigationProvider {...}>
  <UpdateBottomTabBadgeSubscriber />
</NavigationProvider>
```

# Scroll fix on web version

On the web version we need to disable window scroll since else it will sometimes use windows scroll instead of the
scrollview Add this to your css

```css
body {
  overflow: hidden;
}
```

## Native headers & adaptive split

This library favors **real native primitives on iOS/Android, and JS variants only on web** (via `.web.tsx` platform extensions) that match the native look. The guiding rule: don't reimplement in JS what the platform gives you natively — reach for JS only where the platform genuinely can't (web, or a documented UIKit constraint that the new architecture imposes).

### The adaptive split model

Declare the richest layout you want — up to **sidebar → master → detail** — and each platform renders the richest variant it can, auto-collapsing by width:

| Platform | Container | Behavior |
|---|---|---|
| **iOS** | `SplitView` / `TripleSplitView` (JS today; native `UISplitViewController` on the roadmap — see Path B) | wide → columns, narrow → single stack; on iPad the master column mounts a **real** `UINavigationBar` |
| **Android** | same JS split (portable equivalent of `SlidingPaneLayout`) | wide → 2/3-pane, narrow → single stack |
| **Web** | `SplitView` / `TripleSplitView` | full 1/2/3-pane with JS responsive collapse, matching the native look |

Both split components seed their width from `useWindowDimensions()` so they render the correct layout on **first paint** (no null-until-`onLayout` flash, and they work in throttled/background tabs), then refine with the real container width via `onLayout`. Below `breakingPointWidth` the split collapses to just the master/sidebar and every push goes to the main navigator — exactly like a phone with no split at all. Phones are therefore unaffected: the same screen code renders single-column.

The mechanism is a **history-less `StateNavigator` per pane**: a push from the master column *selects* a new detail (it resets the pane to `[root, detail]` instead of stacking), while a push from *inside* a detail scene stacks deeper into that pane. `TripleSplitView` applies the same trick twice — sidebar pushes select the middle column (and reset the detail), middle pushes select the detail column.

### `SplitView` — master/detail with a per-column native bar

The master column can mount its **own** native `UINavigationBar` scoped to the column (iPad Mail style) — it does **not** span into the detail pane. This works because the master is a single, non-pushing scene (row taps drive the *detail* navigator), so an embedded native nav stack at column width is safe — the new-architecture "no push at partial width" limitation never applies to a scene that never pushes.

```tsx
import { SplitView, RightBar, BarButton } from 'react-native-ridge-navigation';

<SplitView
  masterTitle="Posts"           // native bar scoped to the master column (iOS/Android; ignored on web)
  masterLargeTitle              // large title that natively collapses on scroll (default true)
  masterActions={               // native bar buttons on the master bar
    <RightBar>
      <BarButton image={{ uri: 'arrow.up.arrow.down' }} onPress={sort} />  {/* SF Symbol */}
      <BarButton systemItem="add" onPress={add} />                          {/* UIKit systemItem */}
    </RightBar>
  }
  detailPlaceholder={<SelectSomething />}  // shown in the detail pane until a row is tapped
  breakingPointWidth={700}                 // below this: single-column, pushes go full-screen
  masterWidth={360}
>
  <YourList />   {/* row taps push to the DETAIL pane; see the collapse gotcha */}
</SplitView>
```

Props: `masterTitle`, `masterLargeTitle`, `masterActions`, `detailPlaceholder`, `breakingPointWidth` (default 700), `masterWidth` (default 360), `masterStyle`, `detailStyle`.

- **Bar buttons — two mechanisms, both confirmed:** an SF Symbol via `image={{ uri: 'name' }}` (maps to `UIImage systemImageNamed:`), or a UIKit `systemItem` string (`'add'`, `'action'`, `'edit'`, …).
- **Collapse gotcha (handled by the library, but replicate it in your list):** the master list must be **height-bound** so it produces a real scroll view. `MasterPaneScene` already wraps children in a `flex: 1` view; on top of that give your `FlatList`/`ScrollView` `contentInsetAdjustmentBehavior="automatic"` (iOS). Without a finite height the list lays out at full content height (clipped by the column's `overflow: hidden`), never scrolls, and UIKit never binds a collapsible content scroll view — so the large title stays permanently expanded.
- **Detail pane is JS on native:** an `NVNavigationStack` embedded at partial width does not present pushed scenes on the new architecture, so the detail pane keeps its own JS scene stack (`DetailPaneScenes`) — every crumb stays mounted (scroll state survives), only the top one is interactive. The native `UISplitViewController` bridge (Path B) removes this constraint. On web the detail pane is a normal `NavigationStack`.

### `TripleSplitView` — sidebar → middle → detail

Three columns for very wide screens (iPad Mail / macOS Settings). Cross-platform and portable — it needs no `UISplitViewController`, so it renders identically on iOS, Android and web.

```tsx
import { TripleSplitView } from 'react-native-ridge-navigation';

<TripleSplitView
  sidebar={<CategoryList />}          // column 1 — pushes here SELECT the middle column
  masterPlaceholder={<PickCategory />}
  detailPlaceholder={<PickItem />}
  breakingPointWidth={900}            // below this: sidebar-only, pushes go full-screen
  sidebarWidth={260}
  masterWidth={360}
  // Deep-linkable columns: mirror the selection into the URL and restore it on mount.
  initialSelection={{ middle: { path: '/overview', params: {} }, detail: null }}
  onSelectionChange={(sel) => writeToUrl(sel)}  // { middle, detail } as stable screen.path + params
/>
```

`initialSelection` / `onSelectionChange` express each column's selection as the registered **`screen.path` + params** (stable across reloads — not the internal per-instance pane keys), so the three columns become shareable, bookmarkable links without the panes fighting the main navigator for browser history. Selecting a new middle section clears the detail back to its placeholder (switching mailbox empties the message pane).

#### `floatingSidebar` (iOS 26 Health style)

Set `floatingSidebar` to render the sidebar as an **absolutely-positioned translucent glass panel on top of** edge-to-edge content, instead of reserving a column to its left. The middle/detail content then spans from `x=0`, so a colored/gradient background visibly **bleeds under** the sidebar. Make the sidebar surface translucent yourself — a native `BlurView` (`expo-blur`) on iOS, `backdrop-filter` on web:

```tsx
<TripleSplitView
  floatingSidebar
  sidebarWidth={300}
  sidebarStyle={{ borderRightColor: 'rgba(0,0,0,0.08)', borderRightWidth: StyleSheet.hairlineWidth }}
  sidebar={
    <View style={StyleSheet.absoluteFill}>
      {Platform.OS !== 'web'
        ? <BlurView style={StyleSheet.absoluteFill} intensity={60} tint="systemChromeMaterialLight" />
        : <View style={[StyleSheet.absoluteFill, { backdropFilter: 'blur(20px)' }]} />}
      {/* sidebar rows */}
    </View>
  }
  // …middle/detail with an edge-to-edge gradient hero
/>
```

Entity list screens rendered in the middle column can read `useIsInsideSplitPane()` (via the `SplitPaneContext` the split provides) to render list-only — so their row pushes land in the detail column instead of nesting a split inside a split.

### `CollapsingHeader` — one API, native bar + web mirror

A cross-platform iOS-flavoured header. **One API, two renderers**: `CollapsingHeader.tsx` (native) renders a real `UINavigationBar` (large title that collapses on scroll, immersive `barTintColor`, a `RightBar` of `BarButton`s) and owns an inset `ScrollView` so UIKit can collapse the title; `CollapsingHeader.web.tsx` renders an iOS-styled DOM header — a sticky compact bar whose centered title cross-fades in as the large title scrolls away, trailing actions, a hairline on scroll, and an optional immersive tint. Actions are **declarative** (`HeaderAction[]`) so the *same* array drives native `BarButton`s and web DOM buttons:

```tsx
import { CollapsingHeader } from 'react-native-ridge-navigation';

<CollapsingHeader
  title="Home"
  // largeTitle?: boolean (default true) · barTintColor?: string · tintColor?: string
  actions={[
    {
      key: 'search',
      label: 'Search',           // a11y label + web button title
      systemItem: 'search',      // native: UIKit systemItem
      sfSymbol: 'magnifyingglass', // native: SF Symbol (wins over systemItem for the glyph)
      webGlyph: '⌕',             // web: glyph/short text in the DOM button
      onPress: openSearch,
    },
    { key: 'add', label: 'New', systemItem: 'add', webGlyph: '+', onPress: create },
  ]}
>
  <YourScrollContent />
</CollapsingHeader>
```

Register the screen with `nativeHeader: true` so the library hides its default swipe-back bar and lets the screen own the header.

### Immersive colored headers (App Store style)

Pass `barTintColor` for a solid immersive header (`CollapsingHeader` forwards `tintColor` to `titleColor` and `largeTitleColor` for you). If you drop to the raw `NavigationBar`, note the large-title color props exist in the Obj-C `NVNavigationBar` but are **missing from the shipped `.d.ts`** — cast to reach them:

```tsx
<NavigationBar
  hidden={false}
  largeTitle
  title={`Post ${id}`}
  barTintColor="#E8480C"
  tintColor="#FFF"
  titleColor="#FFF"
  {...({ largeTitleColor: '#FFF', largeTitleFontWeight: '800' } as any)}
/>
```

**Inside a split, scope the colored header to the detail column** — a scene-level native bar there spans the full window and bleeds across the master. Use `ScopedCollapsingHeader` (below).

### `ScopedCollapsingHeader` — column-scoped Contacts-style header

A **column-scoped**, Contacts-style immersive header for a `SplitView`/`TripleSplitView` **detail pane**: a soft vertical gradient hero (large avatar, name, round action buttons) that scrolls away, plus an always-on translucent compact bar the list frosts under. It is deliberately a **JS View subtree on native** (not a scene-level `NavigationBar`) precisely so its gradient stays confined to the detail column and never bleeds across the master — but it still uses a **real native blur** for the compact bar via the injected `blurComponent` (e.g. `expo-blur`'s `UIBlurEffect`), so the list genuinely blurs as it scrolls under the bar. Collapse is driven by a native `Animated.Value` (`useNativeDriver`). The `.web.tsx` sibling renders the same look with `backdrop-filter: blur()`.

All props:

```tsx
import { ScopedCollapsingHeader } from 'react-native-ridge-navigation';
import { BlurView } from 'expo-blur';

<ScopedCollapsingHeader
  title={post.title}                       // compact-bar title (the entity name)
  gradientColors={[tint, darken(tint)]}    // soft vertical band, top → bottom (>= 2 stops)
  tintColor="#FFFFFF"                      // hero foreground (name/avatar ring). Default white
  compactTitleColor={tint}                 // COLLAPSED compact-bar title color (over the light list). Defaults to tintColor
  expandedHeight={260}                     // hero height, EXCLUDING top inset. Default 240
  collapsedHeight={48}                     // compact bar height, EXCLUDING top inset. Default 48
  topInset={insets.top}                    // safe-area top (from useSafeAreaInsets). Default 0
  blurComponent={(style) => (              // injected native blur for the compact bar; falls back to a translucent View
    <BlurView style={style} intensity={40} tint="systemThinMaterialLight" />
  )}
  headerLeft={<BackChip />}                // optional leading control in the compact bar
  renderHero={() => (                      // the immersive hero content
    <View style={styles.hero}>
      <SharedElement name={`item${id}`}><Image source={avatar} /></SharedElement>
      <Text style={styles.name}>{post.title}</Text>
      {/* round action buttons */}
    </View>
  )}
  contentContainerStyle={styles.body}      // optional scroll content container style
>
  {body}
</ScopedCollapsingHeader>
```

The library never hard-depends on `expo-blur`: omit `blurComponent` and the compact bar falls back to a translucent `View`.

### Translucent blur under the header

- **Native bar (free):** a `UINavigationBar` is translucent-with-blur by default. Simply **don't set an opaque `barTintColor`** and content frosts under it on scroll (the master scoped bar carries no `barTintColor`, so `navigation-react-native` uses `configureWithDefaultBackground` / `UIBlurEffect` — verified on iPad). Set a solid `barTintColor` only when you *want* the immersive opaque look.
- **Custom JS header:** RN's plain `View` can't backdrop-blur — use a native `BlurView` (`expo-blur`) on iOS/Android (`ScopedCollapsingHeader`'s `blurComponent`), and CSS `backdrop-filter: blur()` on web (the `.web.tsx` variants already do this).

### Native shared-element transitions

Wrap the same element on **both** scenes with the same `name`, and declare it on the destination screen's `sharedElements` option:

```tsx
// source row AND detail hero:
<SharedElement name={`item${id}`}>…</SharedElement>

// destination registration (registerScreen options):
{
  nativeHeader: true,
  sharedElements: (_state, data) => `item${data?.id}`,
}
```

**Preload the destination query** (Ridge's `Link` preloads on `onPressIn` by default) or Suspense masks the flight with a spinner instead of animating the element. Add `fadeMode="through"` on the `SharedElement` to cross-fade.

### Full-screen push — escaping the split

A push can **escape** an enclosing `SplitView`/`TripleSplitView` and present **full-screen over the whole split** (its own screen, full width, back returns to the split) instead of landing in the detail pane — Contacts "Edit" / a compose flow. Pass `fullScreen`:

```tsx
// via Link:
<Link to={routes.PostEditScreen} params={{ id }} fullScreen>
  {(linkProps) => <Pressable {...linkProps}><Text>Edit</Text></Pressable>}
</Link>

// via the hook:
const { push } = useNavigation();
push(routes.PostEditScreen, { id }, { fullScreen: true });
```

Mechanics: the split provides a `FullScreenPushContext` whose function pushes on the **main** navigator (the one the split itself lives in). `useNavigation().push` routes there when `{ fullScreen: true }` and a provider is present; **outside a split it's a no-op that falls back to a normal push**. On web the main navigator is the single history-backed `StateNavigator`, so a full-screen push is just a normal full-screen route (the URL changes) — matching native. `useFullScreenPush()` is exported if you need the raw function.

### Path B: real `UISplitViewController` (roadmap — validated GO)

Everything above ships today with the JS split. A native-Fabric spike validated a **GO** on replacing the JS detail-pane fallback with a real `UISplitViewController` (`.tripleColumn`), which would give **UIKit-owned** column geometry and responsive collapse (Mac → iPad → iPhone, 3 → 2 glass-overlay → 1) and, crucially, let each column's nav controller **push natively at partial width** — removing the one constraint that forces the detail pane onto the JS `DetailPaneScenes` today. Estimated **~2–3 weeks**. The turnkey registration recipe from the spike:

1. **JS component** — `codegenNativeComponent`:
   ```ts
   // NVSplitViewNativeComponent.ts
   import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
   import type { ViewProps } from 'react-native';
   export default codegenNativeComponent<ViewProps>('NVSplitView');
   ```
2. **`package.json`** — point codegen at the native provider so the Fabric component is registered:
   ```json
   {
     "codegenConfig": {
       "name": "RNRidgeNavigationSpec",
       "type": "components",
       "jsSrcsDir": "src",
       "ios": { "componentProvider": { "NVSplitView": "NVSplitViewComponentView" } }
     }
   }
   ```
3. **`react-native.config.js`** — describe the native component for autolinking:
   ```js
   module.exports = {
     dependency: {
       platforms: {
         ios: { componentDescriptors: ['NVSplitViewComponentView'] },
       },
     },
   };
   ```
4. **Native view** — `NVSplitViewComponentView.{h,mm}`: a `RCTViewComponentView` subclass hosting a `UISplitViewController` (`.tripleColumn`), routing `mountChildComponentView:` by index to `.primary` / `.supplementary` / `.secondary` columns so the RN children become the three native columns, and letting UIKit own the collapse. `mask="_" masksToBounds` off so the sidebar glass overlay can float.

Until Path B lands, `SplitView`/`TripleSplitView` are the portable, cross-platform equivalent and the master scoped native bar already delivers the iPad-native header on iOS.

### For agents iterating on this library

- **Layout:** source is `src/` (published as `lib/`, built via `bob build` on `yarn prepare` — never edit `lib/`). The runnable **example app** is in `example/` (a separate yarn workspace) and is **not** shipped in the npm package. `example/src/PostsScreen.tsx` is the split demo; `PostScreen.tsx`/`PostEditScreen.tsx` cover the scoped header, shared-element push and full-screen escape; `HealthScreen.tsx` is the floating sidebar; `HomeScreen.tsx` adopts `CollapsingHeader`.
- **Build loop (from `example/`):** `DEVELOPER_DIR=… PATH="$PWD/node_modules/.bin:$PATH" yarn expo run:ios --device <UDID>`. Web: `yarn web` / `yarn web:build`.
- **Driving the iPad sim:** an iPad in **landscape** needs a coordinate transform when tapping — `native = (y_landscape, 1210 − x_landscape)`.
- **Prove native claims empirically — don't infer platform limits from code comments.** The "a native bar can't scope to a column" assumption turned out to be false; the master-scoped bar works because the master scene never pushes. Screenshot the real app before documenting a limitation.

## Contributing

See the [contributing guide](../../CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

### Checkout our other libraries

- Simple form library for React Native with great UX for developer and
  end-user [react-native-use-form](https://github.com/web-ridge/react-native-use-form)
- Smooth and fast cross platform Material Design date and time picker for React Native
  Paper: [react-native-paper-dates](https://github.com/web-ridge/react-native-paper-dates)
- Smooth and fast cross platform Material Design Tabs for React Native
  Paper: [react-native-paper-tabs](https://github.com/web-ridge/react-native-paper-tabs)

- Simple translations in React (
  Native): [react-ridge-translations](https://github.com/web-ridge/react-ridge-translations)
- Simple global state management in React (Native): [react-ridge-state](https://github.com/web-ridge/react-ridge-state)

