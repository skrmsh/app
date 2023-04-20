import axios, { AxiosError, AxiosResponse } from 'axios';
import { getHTTPUrl } from './helperFunctions';

export const authenticate = (
  username: string,
  password: string,
  serverHost: string,
  secureConnection: boolean,
  errorCallback: (e: AxiosError) => void,
  successCallback: (e: void | AxiosResponse) => void,
) => {
  console.log('logging in...');
  axios
    .post(`${getHTTPUrl(serverHost, secureConnection)}/auth`, {
      email: username,
      password: password,
    })
    .catch(errorCallback)
    .then(successCallback);
};
