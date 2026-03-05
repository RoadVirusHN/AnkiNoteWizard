const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const DelWebpackPlugin = require('del-webpack-plugin');


module.exports = {
  entry: {
    background: "./src/scripts/background/background.ts",
    content: "./src/scripts/content/content.ts",
    root: "./src/front/root.tsx",
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
          loader: "ts-loader",
          options: {
            transpileOnly: false
          }
        },
      },
      // {
      //   test: /\.module\.css$/i,
      //   use: ['style-loader','css-loader' ],
      // },
      {
        test: /\.css$/,
         use: ['style-loader','css-loader' ],
      },
      // {
      //   test: /\.svg$/,
      //   use : ['@svgr/webpack'],
      // },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'public/[name][hash][ext][query]',
        },
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource'
      }
    ],
  },
  plugins: [    
    // popup.html에 popup.js 번들 자동 주입
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/front/index.html'),
      filename: 'index.html',
      chunks: ['root'],
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/manifest.json'), to: 'manifest.json' },
        { from: path.resolve(__dirname, 'src/public/chrome'), to: 'icons' }
      ]
    }),
    new MonacoWebpackPlugin({
      languages: ["css","html"],
      inline: true
    }),
    // new DelWebpackPlugin({
    //   patterns: [
    //     '**/*basic-languages*/**/*.js', // 모든 basic-languages 파일을 기본적으로 포함
    //     '!**/*basic-languages*/*html*.js', // html 관련 파일 제외
    //     '!**/*basic-languages*/*css*.js',  // css 관련 파일 제외
    //     '!**/*basic-languages*/*javascript*.js', // javascript 관련 파일 제외
    //     '!**/*basic-languages*/*typescript*.js', // typescript 관련 파일 제외
    //   ],
    //   // dryRun: true // 삭제 로그
    // })
  ],

};
