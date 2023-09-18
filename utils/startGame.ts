import { AxiosResponse } from 'axios';
import { GameApi, GameGidPutRequest } from '../Api/generated';
import { getApiConfiguration } from './helperFunctions';

export function startGame(
  gameID: string,
  authenticationToken: string,
  gameStartDelay: string,
  serverHost: string,
  secureConnection: boolean,
  callback: (e: AxiosResponse | void) => void,
  showError: (e: string) => void,
) {
  const gameApi = new GameApi(
    getApiConfiguration(serverHost, secureConnection),
  );
  console.log(
    'making game start request to...',
    `${serverHost}, ${secureConnection}/game/${gameID}`,
  );
  const config = {
    headers: {
      'x-access-token': authenticationToken,
    },
  };
  const body: GameGidPutRequest = {
    delay: +gameStartDelay,
  };
  gameApi
    .gameGidPut(gameID, body)
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
