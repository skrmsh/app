import axios, { AxiosResponse } from 'axios';
import { getHTTPUrl } from './helperFunctions';

export const validateAccessToken = async (
  token: string,
  serverHost: string,
  secureConnection: boolean,
  playerNameSetter?: (name: string) => void,
): Promise<boolean> => {
  const config = {
    headers: {
      'x-access-token': token,
    },
  };
  let validationSuccess = false;
  await axios
    .get(`${getHTTPUrl(serverHost, secureConnection)}/user`, config)
    .then((e: AxiosResponse) => {
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
