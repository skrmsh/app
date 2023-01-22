import axios, {AxiosError, AxiosResponse} from 'axios';
import {useState} from 'react';
import { StyleSheet } from 'react-native';
import {Button, ActivityIndicator, TextInput} from 'react-native-paper';
import {Separator} from './seperator';

type AuthHandlerProps = {
  isAuthenticated: boolean;
  setIsAuthenticated: (e: boolean) => void;
  setAuthToken: (e: string) => void;
  showError: (e: string) => void
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
  isAuthenticated,
  setIsAuthenticated,
  setAuthToken,
  showError
}: AuthHandlerProps) => {
  const [username, setUsername] = useState('hanswurst@olel.de');
  const [password, setPassword] = useState('test1234');
  const [authLoading, setAuthLoading] = useState(false);
  return (
    <>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
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
              showError(`http error:', ${e.code}, ${e.message}`)
              setAuthLoading(false);
            },
            (e: void | AxiosResponse) => {
              if (e) {
                setIsAuthenticated(true);
                setAuthToken(e.data.access_token);
                console.log('Successfully authenticated!');
                setAuthLoading(false);
              }
            },
          );
        }}
        disabled={isAuthenticated}>
        Login
      </Button>
      <Separator />
      <Button
        mode="contained"
        onPress={() => {
          setAuthToken('');
          setIsAuthenticated(false);
        }}
        disabled={!isAuthenticated}>
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
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
  },
  button: {
    margin: 12,
  },
});
