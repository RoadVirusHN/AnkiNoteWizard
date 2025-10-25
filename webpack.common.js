const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
  entry: {
    background: "./src/scripts/background.ts",
    content: "./src/scripts/content.ts",
    popup: "./src/popup/popup.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // 빌드 시 이전 파일 삭제
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          //loader: "babel-loader",
          loader: "ts-loader",
          /*options: {
            presets: [
              "@babel/preset-env",   // ESNext → ES5
              "@babel/preset-typescript",
              "@babel/preset-react", // JSX 지원
            ],
          },*/
          options: {
            transpileOnly: false
          }
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use : ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'public/[name][hash][ext][query]',
        },
      },
    ],
  },
  plugins: [    
    // popup.html에 popup.js 번들 자동 주입
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/popup/popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/manifest.json'), to: 'manifest.json' },
        { from: path.resolve(__dirname, 'src/icons'), to: 'icons' },
        { from: path.resolve(__dirname, 'src/popup/popup.css'), to: 'popup.css'}
        // { from: path.resolve(__dirname, 'src/popup/popup.html'), to: 'popup.html' }, // 위 html webpack plugin이 알아서 처리
      ]
    })
  ]
};
