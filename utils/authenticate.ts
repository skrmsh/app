import axios, { AxiosError, AxiosResponse } from 'axios';

export const authenticate = (
  username: string,
  password: string,
  errorCallback: (e: AxiosError) => void,
  successCallback: (e: void | AxiosResponse) => void,
) => {
  console.log('logging in...');
  axios
    .post('https://olel.de/auth', { email: username, password: password })
    .catch(errorCallback)
    .then(successCallback);
};
