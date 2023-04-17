/**
 * @format
 */

import { AppRegistry, SafeAreaView, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import {
  Provider as PaperProvider,
  MD2DarkTheme,
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
  useTheme,
} from 'react-native-paper';

import App from './App';
import { name as appName } from './app.json';
import React from 'react';

export default function Main() {
  /* Selecting Theme based on system */
  const theme = useColorScheme();
  const isDarkTheme = theme === 'dark';
  var mainTheme = isDarkTheme ? DarkTheme : DefaultTheme;
  /* Modifying theme */
  mainTheme.colors.primary = '#e91e62';

  return (
    <PaperProvider theme={mainTheme.dark ? MD3DarkTheme : MD3LightTheme}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: mainTheme.colors.primary }}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: mainTheme.colors.background }}>
        <App theme={mainTheme} />
      </SafeAreaView>
    </PaperProvider>
  );
}
AppRegistry.registerComponent(appName, () => Main);
