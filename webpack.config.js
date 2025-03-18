const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    path.resolve(__dirname, 'src/index.tsx'),
  ],
  output: {
    path: path.resolve(__dirname, 'public/js'),
    publicPath: '/js',
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  target: ['web', 'es6'],
  module: {
    rules: [
      {
        test: /\.([jt]sx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['react-refresh/babel'],
            },
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devServer: {
    hot: true,
  },
  plugins: [
    // (*)
    new ReactRefreshWebpackPlugin()
  ],
};
