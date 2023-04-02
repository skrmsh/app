import axios, { AxiosResponse } from 'axios';

export const getPlayerName = async (
  token: string,
  playerNameSetter: (name: string) => void,
) => {
  const config = {
    headers: {
      'x-access-token': token,
    },
  };
  await axios.get('https://olel.de/user', config).then((e: AxiosResponse) => {
    if (playerNameSetter) {
      playerNameSetter(e.data.username);
    }
    console.log('access token validation succeeded!');
  });
};
