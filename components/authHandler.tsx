import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, TextInput } from 'react-native-paper';
import { ErrorDialog } from './';
import { Separator } from './seperator';


type AuthHandlerProps = {
  authToken: string;
  setAuthToken: (e: string) => void;
};

function authenticate(
  username: string,
  password: string,
  errorCallback: (e: AxiosError) => void,
  successCallback: (e: void | AxiosResponse) => void,
) {
  console.log('logging in...');
  axios
    .post('https://olel.de/auth', {email: username, password: password})
    .catch(errorCallback)
    .then(successCallback);
}

export const AuthHandler = ({
  authToken,
  setAuthToken,
}: AuthHandlerProps) => {
  const [username, setUsername] = useState('hanswurst@olel.de');
  const [password, setPassword] = useState('test1234');
  const [authLoading, setAuthLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('')
  return (
    <>
    <ErrorDialog showingError={showingError} setShowingError={setShowingError} errorMsg={errorMsg}/>
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
              setShowingError(true)
              setAuthLoading(false);
            },
            (e: void | AxiosResponse) => {
              if (e) {
                setAuthToken(e.data.access_token);
                console.log('Successfully authenticated!');
                setAuthLoading(false);
              }
            },
          );
        }}
        disabled={!!authToken}>
        Login
      </Button>
      <Separator />
      <Button
        mode="contained"
        onPress={() => {
          setAuthToken('');
        }}
        disabled={!authToken}>
        Logout
      </Button>
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
