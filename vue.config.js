const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

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

module.exports = {
  pages,
  filenameHashing: false,
  configureWebpack: {
    plugins: [
      CopyWebpackPlugin([
        {
          from: path.resolve(`src/manifest.${process.env.NODE_ENV}.json`),
          to: `${path.resolve("dist")}/manifest.json`,
        },
        {
          from: path.resolve(`src/hot-reload.js`),
          to: `${path.resolve("dist")}/hot-reload.js`,
        },
        {
          from: path.resolve(`icons/*`),
          to: `${path.resolve("dist")}`,
        },
      ]),
    ],
    output: {
      filename: `js/[name].js`,
      chunkFilename: `[name].js`,
    },
  },
};
