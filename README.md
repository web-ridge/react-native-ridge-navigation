
<h1 align="center">
  <img src="https://user-images.githubusercontent.com/6492229/124349256-854c4680-dbee-11eb-84ca-fd410a4a0fcd.png" width="128">
  <br>
  react-native-ridge-navigation (⚠️ in beta)
</h1>

Simple and performant cross platform navigation on iOS, Android and the web with simple and type-safe api for React 18 (alpha)

⚠️ This is beta software, things can break.

Things which are not finished yet:
- documentation
- create universal lazyWithPreload for screens (only on web, but [callstack/repack](https://github.com/callstack/repack) can fix it native too)
- universal modal (web support too)

## Features
- Superior performance (we use [wix/react-native-navigation](https://github.com/wix/react-native-navigation))
- Simple api
- Type safety
- Type safe routes
- Type safe params (based on url)
- Android, iOS & web!
- Preload data on mouseDown (or more sensitive on hover, see `<Link />` example)
- Preload component on hover (on web)
- Automatic deep-linking
- Lazy load components
- Real-time light/dark mode

## Example
[![Demo of react-native-ridge-navigation](https://drive.google.com/uc?id=1nE0DzlaVza_h3K1KCkPnK5NfIXfYM5c-)](https://www.youtube.com/watch?v=EvNxrRIF7C0)

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
  PostScreenLazy,
  ({ id }) => {
    queryClient.prefetchQuery(
      queryKeyPostScreen({ id }),
      queryKeyPostScreenPromise({ id })
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
- sideMenu (in progress)

## Installation

#### 1. If you don't have an app yet (optional, but recommended)
Create the app with our tool [web-ridge/create-react-native-web-application](https://github.com/web-ridge/create-react-native-web-application)
```
npx create-react-native-web-application --name myappname
```

#### 1. Install deps + library

```
yarn add react-native-navigation react-native-navigation-hooks react-native-ridge-navigation history && npx rnn-link && npx pod-install
```
or with npm
```
npm install react-native-navigation react-native-navigation-hooks react-native-ridge-navigation history && npx rnn-link && npx pod-install
```

### 2. Extra (optional)
Add react-native-web-image-loader (see example), this will make sure the images in the BottomBar will be in good quality on the web.
```js
const {
  addWebpackModuleRule,
} = require('customize-cra');

// ...
  addWebpackModuleRule({
    test: /\.(png|jpe?g|gif)$/,
    options: {
      name: 'static/media/[name].[hash:8].[ext]',
      scalings: { '@3x': 1 },
    },
    loader: 'react-native-web-image-loader',
  })
// ...
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

const Navigator = createNavigation(
  defaultTheme,
  createScreens(routes),
  {
    [NavigationRoots.RootHome]: createBottomTabsRoot(
      [BottomRoots.Posts, BottomRoots.Account],
      // optional settings
      // {
      //   breakingPointWidth: 500, // default is 1200
      //   components: {
      //      start: BottomTabStart,
      //      end: BottomTabEnd,
      //   },
      // }
    ),
    [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
    // You can add endless more roots for your app e.g. for different roles of users
    // ...
  },
  AppHOC
);

export default Navigator;
```

## New screen
Use the `<Link />` component as much as possible since it will work with ctrl+click on the web :)
```tsx
<Link
  to={routes.PostScreen}
  params={{ id: `${item.id}` }}
  // mode="default" // optional if sensitive the preload will be called on hover instead of mouseDown
>
  {(linkProps) => (
    <Pressable  {...linkProps}> // or other touchables/buttons
      <Text>go to post</Text>
    </Pressable>
  )}
</Link>
```
Alternative push (or replace)
```tsx
const { push, replace } = useNavigation();

// call this where if you can't use <Link />
push(routes.PostScreen, {
  id: `${item.id}`
});

// call this if e.g. after a create you want to go to edit screen
// but without pushing history to the url-stack or app-stack :)
replace(routes.PostScreen, {
  id: `${item.id}`
});
```

## Switch root
Switch root can be used to switch from e.g. the auth screen to a different entrypoint of your app. E.g. check the role and switch the stacks to different roots for different user roles.
```tsx
<SwitchRoot rootKey={NavigationRoots.RootHome} params={{}} />;
// or e.g.
<SwitchRoot rootKey={NavigationRoots.RootAuth} params={{}} />;
```
## useNavigation
All available properties
```tsx
const {
  refreshBottomTabs, // e.g. after language change and you want to update labels
  updateBadge, // updateBadge(BottomRoots.Projects, '10');
  pop, // go back
  switchBottomTabIndex, // switch bottom tab
  switchRoot,
  preload, // call preload (done automatic on link mouseDown
  push, // calls preload + pushes screen
  replace, // calls preload + pushes screen
} = useNavigation()
```

## Deep linking
You have to enable url schemes etc in your app and it'll work!


## More

```ts
// global
  DeepLinking // see deep linking documentation
  OnlyRenderOnce // see deep linking documentation
  SwitchRoot
  Link
  BackLink // for now .pop() but we'll update this according to Android guidelines later on (to always go back in hierarchy)
  lazyWithPreload // only available on the web: see example app
  Redirect
  NavigationRoot,
  createNavigation,
  refreshBottomTabs,
  updateBadge,
  createBottomTabsRoot,
  createNormalRoot,
  createSideMenuRoot,
  registerScreen,
  createScreens,
  defaultTheme,
  setTheme,
  getTheme,
  createSimpleTheme,
  setPreloadResult, // should not need this as it is done automatically

  // hooks
  useTheme,
  useParams,
  useNavigation,
  useFocus
  usePreloadResult // e.g. usePreloadResult(routes.PostScreen)
```


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
