const path = require('path');
const webpack = require('webpack');


module.exports = {
  entry: './src/App.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // plugins: [
  //   // new webpack.EnvironmentPlugin(['AWS_KEY'])
  //   new webpack.DefinePlugin({
  //     'process.env.AWS_KEY': JSON.stringify('process.env.AWS_KEY'),
  //   }),
  // ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
      "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
    } 
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};