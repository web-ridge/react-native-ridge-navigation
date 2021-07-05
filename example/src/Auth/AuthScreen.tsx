import React, { useState } from 'react';
import { Platform, StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { useFormState, Form, ScrollView } from 'react-native-use-form';

import PaddingView from '../helpers/PaddingView';
import Spacer from '../helpers/Spacer';
import ScreenWrapper from '../helpers/ScreenWrapper';
import SimpleSnackbar from '../helpers/SimpleSnackbar';
import { defaultStyles } from '../helpers/utils';
import { SwitchRoot } from 'react-native-ridge-navigation';
import { NavigationRoots } from '../Navigator';

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
      username: '',
      password: '',
    });

  const onSubmit = () => {
    setLoading(true);
    setError(undefined);

    // TODO fake a timeout
    console.log({ values });
    setError(undefined);
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return <SwitchRoot rootKey={NavigationRoots.RootHome} params={{}} />;
  }

  return (
    <>
      <ScreenWrapper top bottom ScrollView={ScrollView}>
        <KeyboardAvoidingView
          style={defaultStyles.full}
          contentContainerStyle={defaultStyles.full}
          behavior={Platform.OS === 'ios' ? 'position' : 'position'}
        >
          <View style={styles.container} testID="loginScreen">
            <PaddingView>
              <Spacer />

              <Form {...formProps}>
                <TextInput
                  {...username('username')}
                  label="Gebruikersnaam"
                  mode="outlined"
                  style={styles.gutterEnd}
                />
                <TextInput
                  {...password('password')}
                  label="Wachtwoord"
                  mode="outlined"
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
        </KeyboardAvoidingView>
      </ScreenWrapper>
      <SimpleSnackbar testID="error" message={error} />
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
