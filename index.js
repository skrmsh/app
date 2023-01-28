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
} from 'react-native-paper';

import App from './App';
import { name as appName } from './app.json';
import React from 'react';

export default function Main() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider theme={MD3LightTheme}>
        <App />
      </PaperProvider>
    </SafeAreaView>
  );
}
AppRegistry.registerComponent(appName, () => Main);
