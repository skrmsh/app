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

type createNewGameDialogProps = {
  showing: boolean;
  setShowing: (e: boolean) => void;
  possibleGamemodes: string[];
  gamemode: string;
  setGamemode: (e: string) => void;
  callback: (e: string) => void;
};

export const CreateNewGameDialog = ({
  showing,
  setShowing,
  callback,
  gamemode,
  setGamemode,
  possibleGamemodes,
}: createNewGameDialogProps) => {
  const theme = useTheme();
  return (
    <>
      <Portal>
        <Dialog visible={showing} onDismiss={() => setShowing(false)}>
          <Dialog.Icon icon="abacus" size={32} color={theme.colors.error} />
          <Dialog.Content>
            <Text variant="bodyMedium">Please choose a game type:</Text>
            <Picker
              selectedValue={gamemode}
              onValueChange={(itemValue, itemIndex) => setGamemode(itemValue)}>
              {possibleGamemodes.map((e: string) => (
                <Picker.Item label={e} value={e} />
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
