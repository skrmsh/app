import { AxiosError, AxiosResponse } from 'axios';
import { AuthPostRequest, UserApi } from '../Api/generated';
import { getApiConfiguration } from './helperFunctions';

export const authenticate = (
  username: string,
  password: string,
  serverHost: string,
  secureConnection: boolean,
  errorCallback: (e: AxiosError) => void,
  successCallback: (e: void | AxiosResponse) => void,
) => {
  const userApi = new UserApi(
    getApiConfiguration(serverHost, secureConnection),
  );
  console.log('logging in...');
  const body: AuthPostRequest = {
    email: username,
    password: password,
  };
  userApi.authPost(body).catch(errorCallback).then(successCallback);
};
