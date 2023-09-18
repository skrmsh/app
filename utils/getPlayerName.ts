import axios, { AxiosResponse } from 'axios';
import { UserApi, UserInfo } from '../Api/generated';
import { getHTTPUrl } from './helperFunctions';

const userApi = new UserApi();

export const getPlayerName = async (
  token: string,
  serverHost: string,
  secureConnection: boolean,
  playerNameSetter: (name: string) => void,
) => {
  const config = {
    headers: {
      'x-access-token': token,
    },
  };
  await userApi.userGet(config).then((e: AxiosResponse<UserInfo>) => {
    if (playerNameSetter) {
      playerNameSetter(e.data.username);
    }
    console.log('access token validation succeeded!');
  });
};
