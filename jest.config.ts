import type { Config } from 'jest';

const config: Config = {
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!<rootDir>/node_modules/'],
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)',
    'jest-runner',
  ],
  setupFiles: [
    './__mocks__/@react-native-async-storage/jestSetupAsyncStorage.js',
  ],
  preset: 'react-native',
};

export default config;
