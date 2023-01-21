import axios, {AxiosError, AxiosResponse} from 'axios';
import {useState} from 'react';
import {ActivityIndicator, Button, Text} from 'react-native-paper';

type gameManagerProps = {
  authenticationToken: string;
  setCurrentGameName: (e: string) => void;
  currentGameName: string;
  showError: (e: string) => void
};

export const GameManager = ({
  authenticationToken,
  setCurrentGameName,
  currentGameName,
  showError
}: gameManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  function createDebugGame(authenticationToken: string) {
    setIsLoading(true);
    const config = {
      headers: {
        'x-access-token': authenticationToken,
      },
    };
    axios
      .post('https://olel.de/game/0', {gamemode: 'debug'}, config)
      .catch((e: AxiosError) => console.log(e))
      .then((message: AxiosResponse | void) => {
        if (message) {
          console.log('received:', message);
          setCurrentGameName(message.data.gid);
        } else {
          console.log('error during game creation, empty response');
          showError('error during game creation, empty response')
        }
        setIsLoading(false);
      });
  }

  return (
    <>
      {currentGameName ? <Text style={{margin:10}}>Current Game Name: {currentGameName}</Text> : <></>}
      {isLoading ? <ActivityIndicator size="large" /> : <></>}
      <Button
        onPress={() => createDebugGame(authenticationToken)}
        mode="contained">
        Create a new Game
      </Button>
    </>
  );
};
