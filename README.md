
<h1 align="center">
  <img src="https://user-images.githubusercontent.com/6492229/124349256-854c4680-dbee-11eb-84ca-fd410a4a0fcd.png" width="128">
  <br>
  react-native-ridge-navigation (⚠️ in beta)
</h1>

Simple and performant cross platform navigation with simple api, but not yet ready for production usage. Only used internally.

⚠️ This is a very early release, not recommended for production yet.

Things which need to be done:
- useFocus on web
- documentation
- create universal lazyWithPreload for screens (React.lazy not working yet in React Native :( )
- create website with examples
- universal modal screens (web support too)

## Features
- Superior performance (we use [wix/react-native-navigation](https://github.com/wix/react-native-navigation))
- Type safety
- Type safe routes
- TYpe safe params
- Android, iOS & web!
- Preload data on mouseDown (or more sensitive on hover, see `<Link />` example)
- Preload component on hover
- Automatic deep-linking
- Lazy load components
- Real-time light/dark mode

## Example
See https://github.com/web-ridge/react-native-ridge-navigation/tree/main/example

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

```js
// TODO: add examples
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
