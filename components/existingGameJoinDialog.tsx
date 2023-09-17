import React, { useState } from 'react';
import {
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

type existingGameJoinDialogProps = {
  showing: boolean;
  setShowing: (e: boolean) => void;
  gameName: string;
  setGameName: (e: string) => void;
};
export const ExistingGameJoinDialog = ({
  showing,
  setShowing,
  setGameName,
}: existingGameJoinDialogProps) => {
  const [tempName, setTempName] = useState('');
  const theme = useTheme();
  return (
    <>
      <Portal>
        <Dialog visible={showing} onDismiss={() => setShowing(false)}>
          <Dialog.Icon icon="abacus" size={32} color={theme.colors.error} />
          <Dialog.Content>
            <Text variant="bodyMedium">Please input a game name</Text>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              mode="outlined"
              accessibilityLabelledBy={undefined}
              accessibilityLanguage={undefined}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button key={'closeButton'} onPress={() => setShowing(false)}>
              Close
            </Button>
            <Button
              key={'saveButton'}
              onPress={() => {
                setGameName(tempName);
                setShowing(false);
              }}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
