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

const fontConfig = {
  customVariant: {
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      default: 'sans-serif',
    }),
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 22,
    fontSize: 20,
  },
};
const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
};
export default function Main() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <App />
      </PaperProvider>
    </SafeAreaView>
  );
}
AppRegistry.registerComponent(appName, () => Main);
