import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Text,
  TextInput,
} from 'react-native-paper';
import { ErrorDialog } from './';

type AuthHandlerProps = {
  authToken: string;
  setAuthToken: (e: string) => void;
  saveAuthToken: (e: string) => void
};

function authenticate(
  username: string,
  password: string,
  errorCallback: (e: AxiosError) => void,
  successCallback: (e: void | AxiosResponse) => void,
) {
  console.log('logging in...');
  axios
    .post('https://olel.de/auth', { email: username, password: password })
    .catch(errorCallback)
    .then(successCallback);
}

export const AuthHandler = ({ authToken, setAuthToken, saveAuthToken}: AuthHandlerProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [playerName, setPlayerName] = useState('');

  function requestPlayerInfo(accessToken) {
    const config = {
      headers: {
        'x-access-token': accessToken,
      },
    };
    console.log(config);
    axios.get('https://olel.de/user', config).then((e: AxiosResponse) => {
      console.log(e.data);
      setPlayerName(e.data.username);
    });
  }
  if (authToken) {
    requestPlayerInfo(authToken);
  }

  return (
    <>
      <ErrorDialog
        showingError={showingError}
        setShowingError={setShowingError}
        errorMsg={errorMsg}
      />
      {!!playerName ? (
        <>
          <Text variant="displayMedium">Hi, {playerName}!</Text>
          <Avatar.Image
            size={150}
            source={require('../utils/avatars/default02.png')}
          />
          <Button
            mode="contained"
            onPress={() => {
              setAuthToken('');
              setPlayerName('');
              saveAuthToken('')
            }}
            disabled={!authToken}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
            mode="outlined"
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            mode="outlined"
            secureTextEntry
          />
          <Button
            mode="contained"
            onPress={() => {
              setAuthLoading(true);
              authenticate(
                username,
                password,
                (e: AxiosError) => {
                  console.log('http error:', e.code, e.message);
                  setErrorMsg(`http error:, ${e.code}, ${e.message}`);
                  setShowingError(true);
                  setAuthLoading(false);
                },
                (e: void | AxiosResponse) => {
                  if (e) {
                    setAuthToken(e.data.access_token);
                    console.log('Successfully authenticated!');
                    setAuthLoading(false);
                    requestPlayerInfo(e.data.access_token);
                    saveAuthToken(e.data.access_token)
                  }
                },
              );
            }}
            disabled={!!authToken}>
            Login
          </Button>
        </>
      )}
      {authLoading ? <ActivityIndicator size="large" /> : <></>}
    </>
  );
};
const styles = StyleSheet.create({
  input: {
    height: 40,
    marginBottom: 8,
    padding: 12,
  },
  button: {
    margin: 12,
  },
});
