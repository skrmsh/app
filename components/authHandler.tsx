import axios, {AxiosError, AxiosResponse} from 'axios';
import {useState} from 'react';
import {ActivityIndicator, Button, StyleSheet, TextInput} from 'react-native';
import { Separator } from './seperator';

type AuthHandlerProps = {
  isAuthenticated: boolean,
  setIsAuthenticated: (e: boolean) => void;
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
  isAuthenticated,
  setIsAuthenticated,
  setAuthToken,
}: AuthHandlerProps) => {
  const [username, setUsername] = useState("hanswurst@olel.de");
  const [password, setPassword] = useState("test1234");
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
        title={'login'}
        onPress={() => {
            setAuthLoading(true)
          authenticate(
            username,
            password,
            (e: AxiosError) => {
              console.log('http error:', e.code, e.message);
              setAuthLoading(false)
            },
            (e: void | AxiosResponse) => {
              if (e) {
                setIsAuthenticated(true);
                setAuthToken(e.data.access_token);
                console.log("Successfully authenticated!")
                setAuthLoading(false)
              }
            },
          );
        }} disabled={isAuthenticated}></Button>
        <Separator/>
        <Button onPress={() => {
            setAuthToken("")
            setIsAuthenticated(false)
            }} title={"Logout"} disabled={!isAuthenticated}></Button>
        {authLoading ? <ActivityIndicator size="large" /> : <></>}
    </>
  );
};
const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    margin: 12
  }
});
