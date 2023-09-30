import { AxiosResponse } from 'axios';
import { UserApi, UserInfo } from '../Api/generated';
import { getApiConfiguration } from './helperFunctions';

export const getPlayerName = async (
  token: string,
  serverHost: string,
  secureConnection: boolean,
  playerNameSetter: (name: string) => void,
) => {
  const userApi = new UserApi(
    getApiConfiguration(serverHost, secureConnection),
  );
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
