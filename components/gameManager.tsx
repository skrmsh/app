import { AxiosError, AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { Separator, ErrorDialog, CreateNewGameDialog, GidInputBox } from './';
import { getApiConfiguration, getStyles } from '../utils';
import { GameApi, GameGidPostRequest, GamemodeList } from '../Api/generated';
import { View } from 'react-native';

type gameManagerProps = {
  authenticationToken: string;
  setCurrentGameName: (e: string) => void;
  currentGameName: string;
  serverHost: string;
  secureConnection: boolean;
  setWasGameCreated: (e: boolean) => void;
};

export const GameManager = ({
  authenticationToken,
  setCurrentGameName,
  currentGameName,
  serverHost,
  secureConnection,
  setWasGameCreated,
}: gameManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [possibleGamemodes, setPossibleGamemodes] = useState<string[]>([]);
  const [selectedGameMode, setSelectedGameMode] = useState('');
  const [newGameDialogShowing, setNewGameDialogShowing] = useState(false);

  const theme = useTheme();

  const requestGameModes = useCallback(() => {
    const gameApi = new GameApi(
      getApiConfiguration(serverHost, secureConnection),
    );
    gameApi.gamemodeGet().then((e: AxiosResponse<GamemodeList>) => {
      setPossibleGamemodes(e.data.gamemodes);
      setSelectedGameMode(e.data.gamemodes[0]); //hack to ensure selectedGameMode is not null
    });
  }, [serverHost, secureConnection]);

  function createGame(gamemode: string) {
    const gameApi = new GameApi(
      getApiConfiguration(serverHost, secureConnection),
    );
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

      <GidInputBox
        gameName={currentGameName}
        setGameName={(e: string) => {
          setCurrentGameName(e);
          setWasGameCreated(false);
        }}
      />

      <View style={getStyles(theme).marginTop}>
        <CreateNewGameDialog
          possibleGamemodes={possibleGamemodes}
          gamemode={selectedGameMode}
          setGamemode={setSelectedGameMode}
          showing={newGameDialogShowing}
          setShowing={setNewGameDialogShowing}
          callback={(gamemode: string) => {
            createGame(gamemode);
            setWasGameCreated(true);
          }}
        />
      </View>

      {isLoading ? <ActivityIndicator size="large" /> : <></>}
      <Button onPress={() => setNewGameDialogShowing(true)} mode="contained">
        ... or create a new game
      </Button>
    </>
  );
};
