module.exports = {
  verbose: true,
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)',
    'jest-runner',
  ],
  setupFiles: [
    './__mocks__/@react-native-async-storage/jestSetupAsyncStorage.js',
  ],
};
