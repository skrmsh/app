import {Card, ToggleButton} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {Text as PaperText} from 'react-native-paper';
import {useState} from 'react';

type StatusInfoProps = {
  variable: boolean;
  text: string;
  element: any;
};

export const TaskStatusBar = ({variable, text, element}: StatusInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const onButtonToggle = () => {
    setExpanded(!expanded);
  };
  return (
    <>
      <Card style={variable ? styles.done : styles.todo}>
        <Card.Content>
          <PaperText style={styles.papertext} variant="titleLarge">
            {text}
          </PaperText>
          <ToggleButton
            icon={expanded? "arrow-down-drop-circle" : "arrow-up-drop-circle"}
            value="bluetooth"
            onPress={onButtonToggle}
          />
        </Card.Content>
      </Card>
      <View style={expanded ? styles.vis : styles.visnone}>{element}</View>
    </>
  );
};

const styles = StyleSheet.create({
  cardcontent: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 25,
    backgroundColor: '#ff0000',
  },
  image: {
    margin: 6,
  },
  papertext: {
    color: '#ffffff',
  },
  done: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 25,
    backgroundColor: '#008000',
  },
  todo: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 25,
    backgroundColor: '#ff0000',
  },
  visnone: {
    display: 'none',
  },
  vis: {
    display: 'flex',
  },
});
