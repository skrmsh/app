import axios from 'axios';
import { useState } from 'react';
import {
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { Picker } from '@react-native-picker/picker';
import { Theme } from '@react-navigation/native';
import { getStyles } from '../utils';

type createNewGameDialogProps = {
  showing: boolean;
  setShowing: (e: boolean) => void;
  possibleGamemodes: string[];
  gamemode: string;
  setGamemode: (e: string) => void;
  callback: (e: string) => void;
  theme: Theme
};

export const CreateNewGameDialog = ({
  showing,
  setShowing,
  callback,
  gamemode,
  setGamemode,
  possibleGamemodes,
  theme
}: createNewGameDialogProps) => {
  return (
    <>
      <Portal>
        <Dialog style={getStyles(theme).dialog} visible={showing} onDismiss={() => setShowing(false)}>
          <Dialog.Icon icon="pencil" size={32} color={theme.colors.primary} />
          <Dialog.Content>
            <Text variant="bodyLarge">Please choose a game type:</Text>
            <Picker
              selectedValue={gamemode}
              onValueChange={(itemValue, itemIndex) => setGamemode(itemValue)}>
              {possibleGamemodes.map((e: string) => (
                <Picker.Item color={theme.colors.text} key={e} label={e} value={e} />
              ))}
            </Picker>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              key={'saveButton'}
              onPress={() => {
                setShowing(false);
              }}>
              Cancel
            </Button>
            <Button
              key={'createButton'}
              theme={theme}
              mode="contained"
              onPress={() => {
                setShowing(false);
                callback(gamemode);
              }}>
              Create Game
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
