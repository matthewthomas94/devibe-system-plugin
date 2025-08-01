const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    code: './code.ts',
    ui: './ui.ts',
    'code-simple': './code-simple.ts',
    'ui-simple': './ui-simple.ts',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/extractors': path.resolve(__dirname, './extractors'),
      '@/generators': path.resolve(__dirname, './generators'),
      '@/formatters': path.resolve(__dirname, './formatters'),
      '@/utils': path.resolve(__dirname, './utils'),
    },
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
    }),
    new HtmlWebpackPlugin({
      template: './ui-simple.html',
      filename: 'ui-simple.html',
      chunks: ['ui-simple'],
    }),
  ],
});