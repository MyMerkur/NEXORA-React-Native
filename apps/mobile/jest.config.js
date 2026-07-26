module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-image-picker|react-native-webview)/)',
  ],
  moduleNameMapper: {
    '^react-native-webview$': '<rootDir>/__mocks__/react-native-webview.js',
    '^react-native-vision-camera$': '<rootDir>/__mocks__/react-native-vision-camera.js',
  },
};
