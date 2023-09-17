import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { getHTTPUrl, getStyles } from '../utils';
import { ErrorDialog } from './';

type AuthHandlerProps = {
  authToken: string;
  serverHost: string;
  secureConnection: boolean;
};
export const AuthHandler = ({
  authToken,
  serverHost,
  secureConnection,
}: AuthHandlerProps) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [playerName, setPlayerName] = useState('');
  const seed = useState(Math.random().toString(36).substring(2, 7));

  useEffect(() => {
    function requestPlayerInfo(accessToken) {
      const config = {
        headers: {
          'x-access-token': accessToken,
        },
      };
      axios
        .get(`${getHTTPUrl(serverHost, secureConnection)}/user`, config)
        .then((e: AxiosResponse) => {
          setPlayerName(e.data.username);
        });
    }
    console.log('got authToken update signal!');
    if (authToken) {
      console.log('found auth token, requesting player info');
      requestPlayerInfo(authToken);
    }
  }, [authToken, secureConnection, serverHost]);
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
            </Card.Content>
            <Image
              style={getStyles().coverAvatar}
              source={{
                uri: `https://api.dicebear.com/5.x/miniavs/png?seed=${seed}`,
              }}
            />
          </Card>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
