/**
 * @format
 */

import {AppRegistry, SafeAreaView} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import App from './App';
import {name as appName} from './app.json';

export default function Main() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <PaperProvider>
        <App />
      </PaperProvider>
    </SafeAreaView>
  );
}
AppRegistry.registerComponent(appName, () => Main);
