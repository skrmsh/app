module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['import', 'file-progress'],
  rules: {
    'import/no-unused-modules': [1, { unusedExports: true }],
    'file-progress/activate': 1,
  },
};
