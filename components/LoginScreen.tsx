import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';

type Props = {
  accessToken: string;
  setAccessToken: (token: string) => void;
};

export const LoginScreen = ({
  accessToken,
  setAccessToken,
}: Props): JSX.Element => {
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const setupAuth = async () => {
      let authTokenFound = false;
      console.log(
        'Component mounted. Trying to read access token from loacal storage...',
      );
      await retrieveAuthToken().then((value: string | null) => {
        console.log('retrieved:', value);
        if (value) {
          authTokenFound = true;
          console.log('Found Access Token, validating...');
          setAccessToken(value);
        } else {
          console.log('No access token found');
          setLoading(false);
        }
      });
    };
    setupAuth();
  }, []);

  return (
    <ScrollView style={{ margin: 15 }}>
      {loading ? <ActivityIndicator size="large" /> : <></>}
    </ScrollView>
  );
};
