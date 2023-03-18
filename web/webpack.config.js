//var DeclarationBundlerPlugin = require('types-webpack-bundler');
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.peggjs$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 64 * 1024,
              mimetype: "text/plain",
            },
          },
        ],
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 64 * 1024,
              mimetype: "text/plain",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.peggjs', '.json'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'public'),
    library: {
      name: "pokman",
      type: "umd",
    },
  },
  plugins: [
    new TypescriptDeclarationPlugin({
      out: `index.d.ts`,
    })
  ],
  devServer: {
    // progress: true,
    hot: true,
    //https: true,
    allowedHosts: 'all',
    port: 8081,
    //    static: {
    //      directory: path.resolve(__dirname, 'public'),
    //    },
    proxy: {
      "/api": {
        target: 'http://localhost:5082',
        secure: false,
        changeOrigin: true
      },
      //"/assets": {
      //  target: 'http://localhost:5082',
      //  secure: false,
      //  changeOrigin: true
      //},
      '/updates': {
        target: 'ws://localhost:5082',
        ws: true
      },
    },
  },
};
