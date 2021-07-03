# react-native-react-ridge-navigation (BETA)
Simple and performant cross platform navigation with simple api, but not yet ready for production usage. Only used internally.

Things which need to be done:
- Configure theme dark/light
- Remove react-native-paper dependency
- wait for new experimental react-router-dom release: [react-router/pull/7838](https://github.com/ReactTraining/react-router/pull/7838)
- create universal lazyWithPreload for screens

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

#### 1. Install wix/react-native-navigation
Follow steps here: https://wix.github.io/react-native-navigation/docs/before-you-start/

#### 2. Install react-native-navigation-hooks
```sh
yarn add react-native-navigation-hooks
```
or
```sh
npm install react-native-navigation-hooks
```
#### 2. Install react-native-ridge-navigation + deps
```sh
yarn add react-native-paper react-router-dom@experimental react-native-react-ridge-navigation
```
or
```sh
npm install react-native-paper react-router-dom@experimental react-native-react-ridge-navigation
```



## Usage

```js
// TODO: add examples
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
