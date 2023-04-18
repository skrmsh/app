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

export default function Main() {
  /* Selecting Theme based on system */
  const sysTheme = useColorScheme();
  const isDarkTheme = sysTheme === 'dark';
  const baseTheme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;
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
      <SafeAreaView
        style={{ flex: 0, backgroundColor: theme.colors.primary }}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <App />
      </SafeAreaView>
    </PaperProvider>
  );
}
AppRegistry.registerComponent(appName, () => Main);
