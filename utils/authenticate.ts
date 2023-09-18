import axios, { AxiosError, AxiosResponse } from 'axios';
import { AuthPostRequest, UserApi } from '../Api/generated';
import { getHTTPUrl } from './helperFunctions';

const userApi = new UserApi();

export const authenticate = (
  username: string,
  password: string,
  serverHost: string,
  secureConnection: boolean,
  errorCallback: (e: AxiosError) => void,
  successCallback: (e: void | AxiosResponse) => void,
) => {
  console.log('logging in...');
  const body: AuthPostRequest = {
    email: username,
    password: password,
  };
  userApi.authPost(body).catch(errorCallback).then(successCallback);
};
