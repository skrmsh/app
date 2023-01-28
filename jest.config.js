module.exports = {
  verbose: true,
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)',
    'jest-runner',
  ],
};
