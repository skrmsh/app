import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { FAB } from 'react-native-paper';

import { Button, Card, TextInput } from 'react-native-paper';
import {
  authenticate,
  getPlayerName,
  getStyles,
  validateAccessToken,
} from '../utils';
import { ErrorDialog } from './errorDialog';
import { SettingsContainer } from './globalSettings';
import { LoadingDialog } from './loadingDialog';

type Props = {
  accessToken: string;
  setAccessToken: (token: string) => void;
  serverHost: string;
  setServerHost: (serverHost: string) => void;
  callback?: () => void;
};

export const LoginScreen = ({
  accessToken,
  setAccessToken,
  serverHost,
  setServerHost,
  callback,
}: Props): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [globalSettingsShowing, setGlobalSettingsShowing] = useState(false);

  const retrieveAuthToken = () => {
    console.log('attempting ro retrieve authToken from asyncStorage');
    return AsyncStorage.getItem('@authToken');
  };

  const saveAuthToken = (token: string) => {
    AsyncStorage.setItem('@authToken', token)
      .then(() => {
        console.log('successfully saved auth token');
      })
      .catch(e => {
        console.log('error:', e);
      });
  };

  const logout = () => {
    saveAuthToken('');
    setPlayerName('');
    setAccessToken('');
  };

  useEffect(() => {
    if (accessToken) {
      getPlayerName(accessToken, setPlayerName);
    }
  }, [accessToken]);

  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      let authTokenFound = false;
      console.log(
        'Component mounted. Trying to read access token from loacal storage...',
      );
      await retrieveAuthToken().then(async (value: string | null) => {
        console.log('retrieved:', value);
        if (value) {
          authTokenFound = true;
          console.log('Found Access Token, validating...');
          if (await validateAccessToken(value, setPlayerName)) {
            console.log('saving access token');
            setAccessToken(value);
          }
          setLoading(false);
        } else {
          console.log('No access token found');
          setLoading(false);
        }
      });
    };
    setupAuth();
  }, []);

  return (
    <>
      <FAB
        icon="cogs"
        small
        style={getStyles().fab}
        onPress={() => setGlobalSettingsShowing(true)}
      />
      <View style={getStyles().centerContainer}>
        <Image
          resizeMethod="resize"
          style={getStyles().appbarLogo}
          source={{
            uri: `https://github.com/skrmsh/skirmish-assets/blob/main/logo/Logo_TextUnderlinedNoBackground.png?raw=true`,
          }}
        />
      </View>
      <View style={{ margin: 15, height: '100%' }}>
        <ErrorDialog
          showingError={!!errorMsg}
          setShowingError={(e: boolean) => !e && setErrorMsg('')}
          errorMsg={errorMsg}
        />
        <LoadingDialog showingLoading={loading} />

        <SettingsContainer
          visible={globalSettingsShowing}
          setVisible={setGlobalSettingsShowing}
          serverHost={serverHost}
          setServerHost={setServerHost}
        />
        <View
          style={{
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}></View>
        <View style={getStyles().container}>
          <Card style={getStyles().loginCard}>
            {accessToken ? (
              <>
                <Card.Title title={`Welcome ${playerName}!`} />
                <Card.Actions>
                  <Button onPress={logout}>Not me!</Button>
                  <Button onPress={callback}>Continue</Button>
                </Card.Actions>
              </>
            ) : (
              <>
                <TextInput
                  label={'Email'}
                  style={getStyles().input}
                  onChangeText={setUsername}
                  value={username}
                  mode="outlined"
                />
                <TextInput
                  label={'Password'}
                  style={getStyles().input}
                  onChangeText={setPassword}
                  value={password}
                  mode="outlined"
                  secureTextEntry
                />
                <Button
                  onPress={() => {
                    setLoading(true);
                    authenticate(
                      username,
                      password,
                      (e: AxiosError) => {
                        console.log('http error:', e.code, e.message);
                        setErrorMsg(`http error:, ${e.code}, ${e.message}`);
                        setLoading(false);
                      },
                      (e: void | AxiosResponse) => {
                        if (e) {
                          setAccessToken(e.data.access_token);
                          saveAuthToken(e.data.access_token);
                          console.log('Successfully authenticated!');
                          setLoading(false);
                        }
                      },
                    );
                  }}>
                  Login
                </Button>
              </>
            )}
          </Card>
        </View>
      </View>
    </>
  );
};
