/**
 * @format
 */

import { AppRegistry, SafeAreaView, useColorScheme } from 'react-native';
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';

import App from './App';
import { name as appName } from './app.json';
import React from 'react';
import { getStyles } from './utils';

// eslint-disable-next-line import/no-unused-modules
export default function Main() {
  /* Selecting Theme based on system */
  const sysTheme = useColorScheme();
  const isDarkTheme = sysTheme === 'dark';
  const baseTheme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;
  const styles = getStyles(baseTheme);
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#e91e62',
      onPrimary: '#ffffff',
      buttonColor: '#e91e62',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={[styles.flex_0, styles.background_primary]} />
      <SafeAreaView style={[styles.flex_1, styles.background_color]}>
        <App />
      </SafeAreaView>
    </PaperProvider>
  );
}
AppRegistry.registerComponent(appName, () => Main);
