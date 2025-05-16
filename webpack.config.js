const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    path.resolve(__dirname, 'src/index.tsx'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  resolve: {
    fallback: {
      os: false,
      tty: false,
      util: false,
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  target: ['web'],
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
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript'
              ],
            },
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
