import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Text,
  Dialog,
  TextInput,
} from 'react-native-paper';
import {
  Separator,
  ErrorDialog,
  ExistingGameJoinDialog,
  CreateNewGameDialog,
} from './';
import { Theme } from '@react-navigation/native';

type gameManagerProps = {
  authenticationToken: string;
  setCurrentGameName: (e: string) => void;
  currentGameName: string;
  theme: Theme
};

export const GameManager = ({
  authenticationToken,
  setCurrentGameName,
  currentGameName,
  theme
}: gameManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [joinGameModelShowing, setJoinGameModelShowing] = useState(false);
  const [possibleGamemodes, setPossibleGamemodes] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState('');
  const [newGameDialogShowing, setNewGameDialogShowing] = useState(false);

  const requestGameModes = () => {
    axios.get('https://olel.de/gamemode').then((e: AxiosResponse) => {
      setPossibleGamemodes(e.data.gamemodes);
      setSelectedGameMode(e.data.gamemodes[0]); //hack to ensure selectedGameMode is not null
    });
  };

  function createGame(authenticationToken: string, gamemode: string) {
    console.log('Creating game with gamemode ', gamemode);
    setIsLoading(true);
    const config = {
      headers: {
        'x-access-token': authenticationToken,
      },
    };

    axios
      .post('https://olel.de/game/0', { gamemode: gamemode }, config)
      .catch((e: AxiosError) => console.log(e))
      .then((message: AxiosResponse | void) => {
        if (message) {
          console.log('received:', message.data);
          setCurrentGameName(message.data.gid);
        } else {
          console.log('error during game creation, empty response');
          setErrorMsg('error during game creation, empty response');
          setShowingError(true);
        }
        setIsLoading(false);
      });
  }
  useEffect(() => {
    console.log('gameManager was mounted, requesting possible gamemodes...');
    requestGameModes();
  }, []);

  return (
    <>
      <ErrorDialog
        showingError={showingError}
        setShowingError={setShowingError}
        errorMsg={errorMsg}
      />
      <CreateNewGameDialog
        possibleGamemodes={possibleGamemodes}
        gamemode={selectedGameMode}
        setGamemode={setSelectedGameMode}
        showing={newGameDialogShowing}
        setShowing={setNewGameDialogShowing}
        callback={(gamemode: string) =>
          createGame(authenticationToken, gamemode)
        }
        theme={theme}
      />
      <ExistingGameJoinDialog
        gameName={currentGameName}
        setGameName={setCurrentGameName}
        showing={joinGameModelShowing}
        setShowing={setJoinGameModelShowing}
      />

      {currentGameName ? (
        <Text style={{ margin: 10 }}>Current Game Name: {currentGameName}</Text>
      ) : (
        <></>
      )}
      {isLoading ? <ActivityIndicator size="large" /> : <></>}
      <Button onPress={() => setNewGameDialogShowing(true)} mode="contained" theme={theme}>
        Create a new Game
      </Button>
      <Separator />
      <Button onPress={() => setJoinGameModelShowing(true)} mode="contained" theme={theme}>
        Join an existing Game
      </Button>
    </>
  );
};
