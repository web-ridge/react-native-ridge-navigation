
<h1 align="center">
  <img src="https://user-images.githubusercontent.com/6492229/124349256-854c4680-dbee-11eb-84ca-fd410a4a0fcd.png" width="128">
  <br>
  react-native-ridge-navigation (⚠️ in beta)
</h1>

Simple and performant cross platform navigation with simple api, but not yet ready for production usage. Only used internally.

⚠️ This is a very early release, not recommended for production yet.

Things which need to be done:
- Configure theme dark/light
- Remove react-native-paper dependency
- wait for new experimental react-router-dom release: [react-router/pull/7838](https://github.com/ReactTraining/react-router/pull/7838)
- create universal lazyWithPreload for screens
- example app with example stacks
- create website

## Features
- Superior performance (we use [wix/react-native-navigation](https://github.com/wix/react-native-navigation))
- Type safety is important for us
- Android, iOS, web ([ReactTraining/react-router](https://github.com/ReactTraining/react-router)))
- Preload data on hover
- Automatic deep-linking

## Supported stacks
- normal
- bottomTabs
- sideMenu (in progress)

## Installation

#### 1. If you don't have an app yet (optional)
Create one with our tool [web-ridge/create-react-native-web-application](https://github.com/web-ridge/create-react-native-web-application)
```
npx create-react-native-web-application --name myappname
```

#### 1. Install deps + library
Follow steps here: https://wix.github.io/react-native-navigation/docs/before-you-start/

```
yarn add react-native-navigation react-native-navigation-hooks react-native-paper react-router-dom@experimental react-native-ridge-navigation && npx rnn-link && npx pod-install
```
or with npm
```
npm install react-native-navigation react-native-navigation-hooks react-native-paper react-router-dom@experimental react-native-ridge-navigation && npx rnn-link && npx pod-install
```


## Usage

```js
// TODO: add examples
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
