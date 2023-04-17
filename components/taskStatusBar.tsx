import { useState } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { getStyles } from '../utils';
import { Theme } from '@react-navigation/native';

type StatusInfoProps = {
  variable: boolean;
  text: string;
  element: any;
  extraStatus?: boolean;
  extraStatusVariable?: boolean;
  theme: Theme;
};

export const TaskStatusBar = ({
  variable,
  text,
  element,
  extraStatus,
  extraStatusVariable,
  theme,
}: StatusInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const styles = getStyles(theme);
  const onButtonToggle = () => {
    if (!expanded) {
      LayoutAnimation.configureNext({
        duration: 200,
        create: { type: 'linear', property: 'opacity' },
        update: { type: 'linear', property: 'opacity' },
        delete: { type: 'linear', property: 'opacity' },
      });
    }

    setExpanded(!expanded);
  };

  return (
    <>
      <Card
        style={
          variable
            ? styles.done
            : !(extraStatus && extraStatusVariable)
            ? styles.todo
            : styles.extra
        }
        onPress={onButtonToggle}>
        <Card.Title
          titleStyle={styles.papertext}
          title={text}
          right={props => (
            <IconButton
              accessibilityLabelledBy={undefined}
              accessibilityLanguage={undefined}
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
