import {
  ActivityIndicator,
  Dialog,
  Portal,
  useTheme,
} from 'react-native-paper';

import React from 'react';

type loadingDialogProps = {
  showingLoading: boolean;
};
export const LoadingDialog = ({ showingLoading }: loadingDialogProps) => {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={showingLoading}>
        <Dialog.Icon icon="sync" size={32} color={theme.colors.error} />
        <Dialog.Title>Please wait</Dialog.Title>
        <Dialog.Content>
          <ActivityIndicator size={'large'} />
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};
