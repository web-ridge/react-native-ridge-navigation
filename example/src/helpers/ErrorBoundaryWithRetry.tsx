import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '../ui/Button';
import Text from '../ui/Text';

interface State {
  error: Error | null;
}
interface Props {
  children: any;
  fallback?: (params: FallbackProps) => any;
}

interface FallbackProps {
  error: Error | null;
  retry: () => any;
}

class ErrorBoundaryWithRetry extends React.Component<Props, State> {
  state = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error: error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.log('componentDidCatch', error, errorInfo);
  }
  _retry = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;
    if (error) {
      if (typeof fallback === 'function') {
        return fallback({ error, retry: this._retry });
      }
      if (!fallback) {
        return (
          <View style={styles.root}>
            <Text muted style={styles.message}>
              Something went wrong loading this screen.
            </Text>
            <Button onPress={this._retry} variant="outline">
              Try again
            </Button>
          </View>
        );
      }
      return fallback;
    }
    return children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  message: {
    marginBottom: 12,
  },
});

export default ErrorBoundaryWithRetry;
