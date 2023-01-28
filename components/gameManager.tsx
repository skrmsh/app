import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import { useState } from 'react';
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

type gameManagerProps = {
  authenticationToken: string;
  setCurrentGameName: (e: string) => void;
  currentGameName: string;
};

export const GameManager = ({
  authenticationToken,
  setCurrentGameName,
  currentGameName,
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
    });
  };

  function createGame(authenticationToken: string, gamemode: string) {
    console.log('Creating game with mode ', gamemode);
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
          console.log('received:', message);
          setCurrentGameName(message.data.gid);
        } else {
          console.log('error during game creation, empty response');
          setErrorMsg('error during game creation, empty response');
          setShowingError(true);
        }
        setIsLoading(false);
      });
  }

  requestGameModes();

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
      <Button onPress={() => setNewGameDialogShowing(true)} mode="contained">
        Create a new Game
      </Button>
      <Separator />
      <Button onPress={() => setJoinGameModelShowing(true)} mode="contained">
        Join an existing Game
      </Button>
    </>
  );
};
