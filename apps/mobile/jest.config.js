module.exports = {
  preset: '@react-native/jest-preset',
  resolver: '<rootDir>/jest/resolver.js',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer.js',
    ),
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-image-picker|react-native-webview|react-native-svg|lucide-react-native|react-native-reanimated|react-native-worklets|react-native-drawer-layout)/)',
  ],
  moduleNameMapper: {
    '^react-native-webview$': '<rootDir>/__mocks__/react-native-webview.js',
    '^react-native-vision-camera$': '<rootDir>/__mocks__/react-native-vision-camera.js',
    '^react-native-reanimated$': require.resolve('react-native-reanimated/mock.js'),
  },
};
