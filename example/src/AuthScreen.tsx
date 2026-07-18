import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SwitchRoot } from 'react-native-ridge-navigation';
import ScreenWrapper from './helpers/ScreenWrapper';
import { fetchAndSaveProfileForToken } from './useAuthState';
import Introduction from './Introduction';
import NavigationRoots from './NavigationRoots';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import Text from './ui/Text';
import RouteChip from './ui/RouteChip';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');

  async function login() {
    try {
      const token = `${username}_SHOULD_BE_TOKEN_FROM_OAUTH`;
      await fetchAndSaveProfileForToken({ token });
      setError(undefined);
      setLoading(false);
      setDone(true);
    } catch (e) {
      setError((e as any).message || 'Unknown error');
      setLoading(false);
    }
  }

  const onSubmit = () => {
    setLoading(true);
    setError(undefined);
    login();
  };

  if (done) {
    return <SwitchRoot rootKey={NavigationRoots.RootHome} />;
  }

  return (
    <ScreenWrapper top bottom ScrollView={ScrollView}>
      <View style={styles.container} testID="loginScreen">
        <Introduction />
        <View style={styles.route}>
          <RouteChip path="/auth" accent />
        </View>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          testID="username"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={onSubmit}
          returnKeyType="send"
          testID="password"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button testID="submit" onPress={onSubmit} loading={loading}>
          {error ? 'Try again' : 'Sign in'}
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  route: {
    marginTop: 4,
    marginBottom: 24,
  },
  error: {
    color: '#D64545',
    marginBottom: 12,
  },
});
