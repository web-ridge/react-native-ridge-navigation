import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { useFormState, Form, ScrollView } from 'react-native-use-form';

import PaddingView from './helpers/PaddingView';
import Spacer from './helpers/Spacer';
import ScreenWrapper from './helpers/ScreenWrapper';
import { SwitchRoot } from 'react-native-ridge-navigation';
import { NavigationRoots } from './Navigator';
import { fetchAndSaveProfileForToken } from './useAuthState';
import Introduction from './Introduction';

interface SignInFormState {
  username: string;
  password: string;
}

export default function AuthScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState<boolean>(false);

  const [{ values, formProps }, { username, password }] =
    useFormState<SignInFormState>({
      username: 'demo',
      password: 'demo',
    });
  async function login() {
    try {
      const token = `${values.username}_SHOULD_BE_TOKEN_FROM_OAUTH`;
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
    <>
      <ScreenWrapper top bottom ScrollView={ScrollView}>
        <View style={styles.container} testID="loginScreen">
          <PaddingView>
            <Introduction />
            <Spacer />

            <Form {...formProps}>
              <TextInput
                {...username('username')}
                label="Gebruikersnaam"
                mode="flat"
                style={styles.gutterEnd}
              />
              <TextInput
                {...password('password')}
                label="Wachtwoord"
                mode="flat"
                style={styles.gutterEnd}
                onSubmitEditing={onSubmit}
                returnKeyType="send"
              />
              <Button
                testID="submit"
                mode="contained"
                onPress={onSubmit}
                style={styles.gutterStart}
                disabled={loading}
              >
                {loading ? 'Laden...' : ''}
                {error ? 'Probeer opnieuw' : ''}
                {!loading && !error ? 'Inloggen' : ''}
              </Button>
            </Form>

            <Spacer />
          </PaddingView>
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  orContainer: {
    marginTop: 24,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignSelf: 'center',

    width: '100%',
    maxWidth: 400,
    flexDirection: 'column',
  },
  form: {
    // alignItems: 'flex-start',
  },
  gutterEnd: {
    marginBottom: 6,
  },
  gutterStart: {
    marginTop: 12,
  },
});
