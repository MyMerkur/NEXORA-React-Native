'use strict';

// Composes two upstream custom resolvers we need at once, since Jest only accepts one:
// - @react-native/jest-preset/jest/resolver.js (strips react-native's package.json `exports`
//   so Jest can still reach internal paths — RFC0894 backwards compatibility)
// - react-native-worklets/jest/resolver.js (drops `.native.*` extensions when resolving
//   worklets' own files, so it doesn't pull in the real native module in the Jest/Node env)
module.exports = (request, options) => {
  const originalPackageFilter = options.packageFilter;

  let resolveOptions = {
    ...options,
    packageFilter: (pkg) => {
      const filteredPkg = originalPackageFilter ? originalPackageFilter(pkg) : pkg;
      if (filteredPkg.name === 'react-native') {
        delete filteredPkg.exports;
      }
      return filteredPkg;
    },
  };

  if (options.basedir.includes('react-native-worklets') || request.includes('react-native-worklets')) {
    resolveOptions = {
      ...resolveOptions,
      extensions: resolveOptions.extensions?.filter((ext) => !ext.includes('native')),
    };
  }

  return options.defaultResolver(request, resolveOptions);
};
