import axios, { AxiosError, AxiosResponse } from 'axios';

export function startGame(
  gameID: string,
  authenticationToken: string,
  gameStartDelay: string,
  callback: (e: AxiosResponse | void) => void,
  showError: (e: string) => void,
) {
  console.log(
    'making game start request to...',
    `https://olel.de/game/${gameID}`,
  );
  const config = {
    headers: {
      'x-access-token': authenticationToken,
    },
  };
  axios
    .put(`https://olel.de/game/${gameID}`, { delay: +gameStartDelay }, config)
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
