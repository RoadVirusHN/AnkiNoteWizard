const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "production",
  devtool: false, // 소스맵 제거
  output: {
    path: path.resolve(__dirname, "release"), // 배포용 폴더
  },
  optimization: {
    minimize: true, // 코드 압축
  },
});
