const React = require('react');
const { View } = require('react-native');

function Camera(props) {
  return React.createElement(View, { testID: 'mock-camera', ...props });
}

module.exports = {
  Camera,
  useCameraDevice: () => ({ id: 'mock-device' }),
  useCameraPermission: () => ({ hasPermission: true, requestPermission: async () => true }),
  useCodeScanner: (options) => options,
};
