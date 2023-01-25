import { useState } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

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

  const styles = StyleSheet.create({
    papertext: {
      color: '#ffffff',
    },
    done: {
      flex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      backgroundColor: theme.colors.primary,
    },
    extra: {
      flex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      backgroundColor: '#ff8800',
    },
    todo: {
      flex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      backgroundColor: theme.colors.error,
    },
    visnone: {
      display: 'none',
    },
    vis: {
      display: 'flex',
      width: '94%',
      borderBottomEndL: 10,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: '#ededed',
      marginLeft: 'auto',
      marginRight: 'auto',
      borderTopEndRadius: 0,
      padding: 20,
      marginBottom: 10,
    },
    expandbutton: {
      borderWidth: 1,
      flex: 2,
    },
    childcontainer: {
      borderWidth: 1,
    },
  });
  

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

