import { useState } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { getStyles } from '../utils';

type StatusInfoProps = {
  variable: boolean;
  text: string;
  element: any;
  extraStatus?: boolean,
  extraStatusVariable?: boolean
};

export const TaskStatusBar = ({variable, text, element, extraStatus, extraStatusVariable}: StatusInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme)
  const onButtonToggle = () => {
    if (!expanded) {
      LayoutAnimation.configureNext({
        duration: 200,
        create: {type: 'linear', property: 'opacity'},
        update: {type: 'linear', property: 'opacity'},
        delete: {type: 'linear', property: 'opacity'},
      });
    }

    setExpanded(!expanded);
  };

  
  

  return (
    <>
      <Card
        style={variable ? styles.done: !(extraStatus && extraStatusVariable) ? styles.todo : styles.extra}
        onPress={onButtonToggle}>
        <Card.Title
          titleStyle={styles.papertext}
          title={text}
          right={props => (
            <IconButton
              {...props}
              icon={
                expanded ? 'arrow-up-drop-circle' : 'arrow-down-drop-circle'
              }
              onPress={onButtonToggle}
            />
          )}></Card.Title>
      </Card>
      <View style={expanded ? styles.vis : styles.visnone}>{element}</View>
    </>
  );
};

