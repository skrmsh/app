import axios, {AxiosResponse} from 'axios';

export function startGame(
  gameID: string,
  authenticationToken: string,
  gameStartDelay: string,
  callback: (e: AxiosResponse | void) => void,
  showError: (e: string) => void,
) {
  console.log("logging in...")
  const config = {
    headers: {
      'x-access-token': authenticationToken,
    },
  };
  axios
    .put(
      `https://olel.de/game/${gameID}`,
      {delay: +gameStartDelay},
      config,
    )
    .catch(showError)
    .then(callback);
};
