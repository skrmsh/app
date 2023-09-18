import axios, { AxiosError, AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import {
  Separator,
  ErrorDialog,
  ExistingGameJoinDialog,
  CreateNewGameDialog,
} from './';
import { getHTTPUrl, getStyles } from '../utils';
import { GameApi, GameGidPostRequest, GamemodeList } from '../Api/generated';

type gameManagerProps = {
  authenticationToken: string;
  setCurrentGameName: (e: string) => void;
  currentGameName: string;
  serverHost: string;
  secureConnection: boolean;
};

const gameApi = new GameApi();

export const GameManager = ({
  authenticationToken,
  setCurrentGameName,
  currentGameName,
  serverHost,
  secureConnection,
}: gameManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [joinGameModelShowing, setJoinGameModelShowing] = useState(false);
  const [possibleGamemodes, setPossibleGamemodes] = useState<string[]>([]);
  const [selectedGameMode, setSelectedGameMode] = useState('');
  const [newGameDialogShowing, setNewGameDialogShowing] = useState(false);

  const requestGameModes = useCallback(() => {
    gameApi.gamemodeGet().then((e: AxiosResponse<GamemodeList>) => {
      setPossibleGamemodes(e.data.gamemodes);
      setSelectedGameMode(e.data.gamemodes[0]); //hack to ensure selectedGameMode is not null
    });
  }, [serverHost, secureConnection]);

  function createGame(gamemode: string) {
    console.log('Creating game with gamemode ', gamemode);
    setIsLoading(true);
    const config = {
      headers: {
        'x-access-token': authenticationToken,
      },
    };
    const body: GameGidPostRequest = {
      gamemode: gamemode,
    };
    gameApi
      .gameGidPost('0', body, config)
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
  }, [requestGameModes]);

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
        callback={(gamemode: string) => createGame(gamemode)}
      />
      <ExistingGameJoinDialog
        gameName={currentGameName}
        setGameName={setCurrentGameName}
        showing={joinGameModelShowing}
        setShowing={setJoinGameModelShowing}
      />

      {currentGameName ? (
        <Text style={getStyles().m10}>
          Current Game Name: {currentGameName}
        </Text>
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
