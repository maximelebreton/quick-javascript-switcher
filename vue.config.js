const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const GenerateJsonFromJsPlugin = require("generate-json-from-js-webpack-plugin");
const webpack = require('webpack');


process.env.VUE_APP_VERSION = process.env.npm_package_version;

const outputDir = process.env.NODE_ENV === "production" ? ".build" : "dist";
const productionSourceMap =
  process.env.NODE_ENV === "production" ? false : true;

// Generate pages object
const pages = {};

const chromeName = process.env.VUE_APP_FILE.split(",");

chromeName.forEach((name) => {
  pages[name] = {
    entry: `src/entry/${name}.ts`,
    template: "public/index.html",
    filename: `${name}.html`,
  };
});

const hotReload = {
  from: path.resolve(`src/hot-reload.js`),
  to: `${path.resolve(outputDir)}/hot-reload.js`,
};

const toCopy = [
  // {
  //   from: path.resolve(`src/manifest.${process.env.NODE_ENV}.json`),
  //   to: `${path.resolve(outputDir)}/manifest.json`,
  // },
  {
    from: path.resolve(
      `src/service-worker.${
        process.env.NODE_ENV === "development" ? "development" : "production"
      }.js`
    ),
    to: `${path.resolve(outputDir)}/service-worker.js`,
  },
  {
    from: path.resolve(`icons/*`),
    to: `${path.resolve(outputDir)}`,
  },
];

if (process.env.NODE_ENV === "development") {
  toCopy.push(hotReload);
}

module.exports = {
  pages,
  filenameHashing: false,
  outputDir: outputDir,
  productionSourceMap: productionSourceMap,
  configureWebpack: {
    devtool: "cheap-module-source-map",
    plugins: [
      new webpack.DefinePlugin({
        // Vue CLI is in maintenance mode, and probably won't merge my PR to fix this in their tooling
        // https://github.com/vuejs/vue-cli/pull/7443
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      }),
      CopyWebpackPlugin(toCopy),
      new GenerateJsonFromJsPlugin({
        path: "./src/manifest.js",
        filename: "manifest.json",
      }),
    ],
    output: {
      filename: `js/[name].js`,
      chunkFilename: `[name].js`,
    },
  },
};
