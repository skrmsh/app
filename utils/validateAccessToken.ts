import { AxiosResponse } from 'axios';
import { UserApi, UserInfo } from '../Api/generated';
import { getApiConfiguration } from './helperFunctions';

export const validateAccessToken = async (
  token: string,
  serverHost: string,
  secureConnection: boolean,
  playerNameSetter?: (name: string) => void,
): Promise<boolean> => {
  const userApi = new UserApi(
    getApiConfiguration(serverHost, secureConnection),
  );
  const config = {
    headers: {
      'x-access-token': token,
    },
  };
  let validationSuccess = false;
  await userApi
    .userGet(config)
    .then((e: AxiosResponse<UserInfo>) => {
      if (playerNameSetter) {
        playerNameSetter(e.data.username);
      }
      console.log('access token validation succeeded!');
      validationSuccess = true;
    })
    .catch((reason: any) => {
      console.log('access token validation failed!', reason);
    });
  return validationSuccess;
};
