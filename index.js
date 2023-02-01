/**
 * @format
 */

import { AppRegistry, SafeAreaView } from 'react-native';
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
  const theme = useTheme();
  return (
    <PaperProvider theme={MD3DarkTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <App />
      </SafeAreaView>
    </PaperProvider>
  );
}
AppRegistry.registerComponent(appName, () => Main);
