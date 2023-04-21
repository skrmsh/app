import axios, { AxiosError, AxiosResponse } from 'axios';
import { getHTTPUrl } from './helperFunctions';

export function startGame(
  gameID: string,
  authenticationToken: string,
  gameStartDelay: string,
  serverHost: string,
  secureConnection: boolean,
  callback: (e: AxiosResponse | void) => void,
  showError: (e: string) => void,
) {
  console.log(
    'making game start request to...',
    `${getHTTPUrl(serverHost, secureConnection)}/game/${gameID}`,
  );
  const config = {
    headers: {
      'x-access-token': authenticationToken,
    },
  };
  axios
    .put(
      `${getHTTPUrl(serverHost, secureConnection)}/game/${gameID}`,
      { delay: +gameStartDelay },
      config,
    )
    .then(response => {
      console.log(response);
      callback(response);
    })
    .catch(error => {
      console.log('error!:', error);
      showError(
        `Error while starting Game: Code ${error.code} ${error.message}`,
      );
    });
}
