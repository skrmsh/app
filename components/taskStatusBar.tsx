import React, { useState } from 'react';
import { LayoutAnimation, View } from 'react-native';
import { Card, IconButton, useTheme } from 'react-native-paper';
import { getStyles } from '../utils';

type StatusInfoProps = {
  variable: boolean;
  text: string;
  element: any;
  extraStatus?: boolean;
  extraStatusVariable?: boolean;
};

const ImageButton = (expanded, onButtonToggle, props) => {
  return (
    <IconButton
      accessibilityLabelledBy={undefined}
      accessibilityLanguage={undefined}
      {...props}
      icon={expanded ? 'arrow-up-drop-circle' : 'arrow-down-drop-circle'}
      onPress={onButtonToggle}
    />
  );
};

export const TaskStatusBar = ({
  variable,
  text,
  element,
  extraStatus,
  extraStatusVariable,
}: StatusInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
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
          right={props => ImageButton(expanded, onButtonToggle, props)}
        />
      </Card>
      <View style={expanded ? styles.vis : styles.visnone}>{element}</View>
    </>
  );
};
