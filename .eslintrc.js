module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['import'],
  rules: {
    'import/no-unused-modules': [1, { unusedExports: true }],
  },
};
