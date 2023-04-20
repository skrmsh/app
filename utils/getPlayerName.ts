import axios, { AxiosResponse } from 'axios';
import { getHTTPUrl } from './helperFunctions';

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
  await axios
    .get(`${getHTTPUrl(serverHost, secureConnection)}/user`, config)
    .then((e: AxiosResponse) => {
      if (playerNameSetter) {
        playerNameSetter(e.data.username);
      }
      console.log('access token validation succeeded!');
    });
};
