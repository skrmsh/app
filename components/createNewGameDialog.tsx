import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { getStyles } from '../utils';

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
        <Dialog
          style={getStyles(theme).dialog}
          visible={showing}
          onDismiss={() => setShowing(false)}>
          <Dialog.Icon icon="pencil" size={32} color={theme.colors.primary} />
          <Dialog.Content>
            <Text variant="bodyLarge">Please choose a game type:</Text>
            <Picker
              selectedValue={gamemode}
              onValueChange={(itemValue, _itemIndex) => setGamemode(itemValue)}>
              {possibleGamemodes.map((e: string) => (
                <Picker.Item
                  color={theme.colors.onPrimary}
                  key={e}
                  label={e}
                  value={e}
                />
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
