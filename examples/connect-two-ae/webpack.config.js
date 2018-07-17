const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const PurgecssPlugin = require('purgecss-webpack-plugin')
let glob = require('glob-all')

const distFolder = path.resolve(__dirname, 'dist')
const jsLoader = 'babel-loader!standard-loader?error=true'

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract (content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

module.exports = {
  mode: process.env.NODE_ENV === 'prod' ? 'production' : 'development',
  resolve: {
    alias: {
      AE_SDK: '../../../../../dist/'
    }
  },
  entry: {
    'aepp': './aepp/src/index.js',
    'wallet': './wallet/src/index.js'
  },
  output: {
    filename: '[name]/bundle.js?[hash]'
  },
  devServer: {
    contentBase: [path.join(__dirname, 'dist/wallet'), path.join(__dirname, 'dist/aepp')]
  },
  devtool: process.env.NODE_ENV === 'prod' ? '' : 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['wallet'],
      title: 'Base (Wallet) Example Æpp',
      template: './wallet/src/index.html',
      filename: 'wallet/index.html',
      alwaysWriteToDisk: true
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['aepp'],
      title: 'Example Æpp',
      template: './aepp/src/index.html',
      filename: 'aepp/index.html',
      alwaysWriteToDisk: true
    }),
    new PurgecssPlugin({
      // Specify the locations of any files you want to scan for class names.
      paths: glob.sync([
        path.join(__dirname, 'wallet/src/**/*.vue'),
        path.join(__dirname, 'wallet/src/index.html'),
        path.join(__dirname, 'aepp/src/**/*.vue'),
        path.join(__dirname, 'aepp/src/index.html')
      ]),
      extractors: [
        {
          extractor: TailwindExtractor,
          // Specify the file extensions to include when scanning for
          // class names.
          extensions: ['html', 'js', 'php', 'vue']
        }
      ]
    }),
    new HtmlWebpackHarddiskPlugin(),
    new ExtractTextPlugin('style.css?[hash]'),
    new CleanWebpackPlugin([distFolder]),
    new VueLoaderPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: jsLoader,
        include: [path.resolve(__dirname, 'aepp'), path.resolve(__dirname, 'wallet')]
        // exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: 'postcss.config.js'
                }
              }
            }
          ]
          // publicPath: '/web'
        })
      },
      // allows vue compoents in '<template><html><script><style>' syntax
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: jsLoader
          }
          // extractCSS: true
          // other vue-loader options go here
        }
      }
    ]
  }
}