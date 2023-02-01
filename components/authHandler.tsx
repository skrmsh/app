import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Text,
  TextInput,
} from 'react-native-paper';
import { getStyles, hashString } from '../utils';
import { ErrorDialog } from './';
import { Separator } from './seperator';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    .post('https://olel.de/auth', { email: username, password: password })
    .catch(errorCallback)
    .then(successCallback);
}

export const AuthHandler = ({ authToken, setAuthToken }: AuthHandlerProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [seed, setSeed] = useState(Math.random().toString(36).substring(2, 7));

  function saveAuthToken(token: string) {
    AsyncStorage.setItem('@authToken', token)
      .then(() => {
        console.log('successfully saved auth token');
      })
      .catch(e => {
        console.log('error:', e);
      });
  }
  function retrieveAuthToken(callback: (e: string) => void) {
    console.log('attempting ro retrieve authToken from asyncStorage');
    AsyncStorage.getItem('@authToken').then((value: string | null) => {
      console.log('retrieved:', value);
      if (value) {
        callback(value);
      }
    });
  }

  function requestPlayerInfo(accessToken) {
    const config = {
      headers: {
        'x-access-token': accessToken,
      },
    };
    axios.get('https://olel.de/user', config).then((e: AxiosResponse) => {
      setPlayerName(e.data.username);
    });
  }
  useEffect(() => {
    console.log('authHandler was mounted!');
    retrieveAuthToken((authToken: string) => {
      setAuthToken(authToken);
      setSeed(`${hashString(authToken)}`);
    });
  }, []);
  useEffect(() => {
    console.log('got authToken update signal!');
    if (authToken) {
      console.log('found auth token, requesting player info');
      requestPlayerInfo(authToken);
    }
  }, [authToken]);
  const styles = getStyles();
  return (
    <>
      <ErrorDialog
        showingError={!!errorMsg}
        setShowingError={(e: boolean) => !e && setErrorMsg('')}
        errorMsg={errorMsg}
      />
      {playerName ? (
        <>
          <Card>
            <Card.Content>
              <Text variant="titleMedium" key={'deviceid'}>
                Hi, {playerName}!
              </Text>
              <Text key={'accesstoken'}>{authToken}</Text>
            </Card.Content>
            <Image
              style={getStyles().coverAvatar}
              source={{
                uri: `https://api.dicebear.com/5.x/miniavs/png?seed=${seed}`,
              }}
            />
            <Card.Actions key={'connect'}>
              <Button
                mode="contained"
                key={'bruteforceconnect'}
                onPress={() => {
                  setAuthToken('');
                  saveAuthToken('');
                  setPlayerName('');
                }}
                testID={'connectButton'}>
                Logout
              </Button>
            </Card.Actions>
          </Card>
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
                  setAuthLoading(false);
                },
                (e: void | AxiosResponse) => {
                  if (e) {
                    setAuthToken(e.data.access_token);
                    saveAuthToken(e.data.access_token);
                    console.log('Successfully authenticated!');
                    setAuthLoading(false);
                    requestPlayerInfo(e.data.access_token);
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
