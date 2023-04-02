import axios, { AxiosResponse } from 'axios';

export const validateAccessToken = async (
  token: string,
  playerNameSetter?: (name: string) => void,
): Promise<boolean> => {
  const config = {
    headers: {
      'x-access-token': token,
    },
  };
  let validationSuccess = false;
  await axios
    .get('https://olel.de/user', config)
    .then((e: AxiosResponse) => {
      if (playerNameSetter) {
        playerNameSetter(e.data.username);
      }
      console.log('access token validation succeeded!');
      validationSuccess = true;
    })
    .catch(() => {
      console.log('access token validation failed!');
    });
  return validationSuccess;
};
