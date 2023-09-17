import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import React from 'react';

type errorDialogProps = {
  showingError: boolean;
  setShowingError: (e: boolean) => void;
  errorMsg: string;
};
export const ErrorDialog = ({
  showingError,
  setShowingError,
  errorMsg,
}: errorDialogProps) => {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={showingError} onDismiss={() => setShowingError(false)}>
        <Dialog.Icon
          icon="alert-octagon"
          size={32}
          color={theme.colors.error}
        />
        <Dialog.Content>
          <Text variant="bodyMedium">{errorMsg}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button key={'closeButton'} onPress={() => setShowingError(false)}>
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
