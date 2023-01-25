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
  gameName,
  setGameName,
}: existingGameJoinDialogProps) => {
  const theme = useTheme();
  return (
    <>
      <Portal>
        <Dialog visible={showing} onDismiss={() => setShowing(false)}>
          <Dialog.Icon icon="abacus" size={32} color={theme.colors.error} />
          <Dialog.Content>
            <Text variant="bodyMedium">Please input a game name</Text>
            <TextInput
              value={gameName}
              onChangeText={setGameName}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button key={'closeButton'} onPress={() => setShowing(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
