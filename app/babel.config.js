module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@stores": "./stores",
            "@lib": "./lib",
            "@src": "./src"
          }
        }
      ],
      "nativewind/babel",
      // Reanimated must be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
