<h1 align="center">
  <img src="https://user-images.githubusercontent.com/6492229/124349256-854c4680-dbee-11eb-84ca-fd410a4a0fcd.png" width="128">
  <br>
  react-native-ridge-navigation
</h1>

Simple and performant navigation on iOS, Android and the web with simple and type-safe api.

Build on top of [grahammendick/navigation](https://github.com/grahammendick/navigation). Check it out if you want more
control over the navigation!



## Features

- New architecture (Fabric) ready
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

## Example

[![Demo of react-native-ridge-navigation](https://drive.google.com/uc?id=1nE0DzlaVza_h3K1KCkPnK5NfIXfYM5c-)](https://www.youtube.com/watch?v=EvNxrRIF7C0)
This is an older video which used react-native-navigation so we have newer material you bottom bar in the meantime :)
View video in better frame [on YouTube](https://www.youtube.com/watch?v=EvNxrRIF7C0)

## About us

We want developers to be able to build software faster using modern tools like GraphQL, Golang and React Native.

Give us a follow on Twitter:
[RichardLindhout](https://twitter.com/RichardLindhout),
[web_ridge](https://twitter.com/web_ridge)

## Donate

Please contribute or donate so we can spend more time on this library

[Donate with PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7B9KKQLXTEW9Q&source=url)

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
yarn add react-native-navigation navigation navigation-react navigation-react-mobile navigation-react-native
```

or with npm

```
npm install react-native-navigation navigation navigation-react navigation-react-mobile navigation-react-native
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

```tsx
import {
  createNormalRoot,
  createNavigation,
  createBottomTabsRoot,
  createScreens,
  defaultTheme,
} from 'react-native-ridge-navigation';

export const NavigationRoots = {
  RootHome: 'home',
  RootAuth: 'auth',
};

// svg to png
// https://webkul.github.io/myscale/
//
// tab icon
// http://nsimage.brosteins.com/Home
export const BottomRoots = {
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
    {
      breakingPointWidth: 500,
      components: {
        override: HeaderWeb,
      },
    }
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

See example code for the asyncboundary stuff :)

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

Alternative push (or replace)

```tsx
const { push, replace, refresh } = useNavigation();

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

E.g. our example app can open the following urls:
### crumb


### Bottom tabs

navigation://home/post/post-1

## normal stack

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
  StatusBar,
  FocusAwareStatusBar,
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

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

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

