const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackErrorNotificationPlugin = require('webpack-error-notification');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
//const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: ['@babel/polyfill','./src/js/main.js'],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'game.bundle.js'
  },

  resolve: {
    alias: {
      Skeleton: path.resolve(__dirname, 'src/js/skeleton/'),
      Component: path.resolve(__dirname, 'src/js/ui/component/'),
      Util: path.resolve(__dirname, 'src/js/ui/util/'),
      ViewModel: path.resolve(__dirname, 'src/js/ui/viewmodel/'),
      Page: path.resolve(__dirname, 'src/js/ui/page/'),
      PageUi: path.resolve(__dirname, 'src/js/ui/page/ui'),
      Root: path.resolve(__dirname, 'src/js/ui/'),
      Api: path.resolve(__dirname, 'src/js/api/')
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ["@babel/preset-env"]
        }
      }
    ]
  },

  plugins: [
    new FriendlyErrorsWebpackPlugin()
  ],

  optimization: {
    minimizer: [new UglifyJsPlugin()]
  }
};
