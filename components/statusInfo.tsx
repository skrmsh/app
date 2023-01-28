import { Device } from 'react-native-ble-plx';
import { Card } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { Text as PaperText } from 'react-native-paper';

type StatusInfoProps = {
  isAuthenticated: boolean;
  connectedDevices: Device[];
};

export const StatusInfo = ({
  isAuthenticated,
  connectedDevices,
}: StatusInfoProps) => {
  return (
    <Card style={styles.cardcontent}>
      <Card.Content>
        <PaperText variant="titleLarge">Steps to start/join a game:</PaperText>
        <PaperText
          variant="bodyMedium"
          style={isAuthenticated ? styles.done : styles.todo}>
          1. Authenticate yourself.
        </PaperText>
        <PaperText
          variant="bodyMedium"
          style={connectedDevices.length > 0 ? styles.done : styles.todo}>
          2. Connect to at least one Phasor.
        </PaperText>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardcontent: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 25,
  },
  image: {
    margin: 6,
  },
  done: {
    color: '#008000',
  },
  todo: {
    color: '#ff0000',
  },
});
