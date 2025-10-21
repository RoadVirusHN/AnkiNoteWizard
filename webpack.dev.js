const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map", // 디버깅용 source map
  output: {
    path: path.resolve(__dirname, "dist"), // 개발용 폴더
  },
});
