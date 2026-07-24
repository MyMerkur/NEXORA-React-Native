const React = require('react');
const { View } = require('react-native');

function WebView(props) {
  return React.createElement(View, { testID: 'mock-webview', ...props });
}

module.exports = { WebView };
