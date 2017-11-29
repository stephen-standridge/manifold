var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();

// non-sensative env variables
var piece_env = require('./configuration/environment');
var PIECE_SLUG = piece_env.PIECE_SLUG;
var PIECE_TITLE = piece_env.PIECE_TITLE;

module.exports = {
		watch: true,
    context: __dirname,
    entry: {
      index: ["./source/app/index.html", "./source/app/manifold.js"],
      vendor: ['three', 'immutable', 'rx-dom', 'rx', 'abstracts']
    },
    output: {
      filename: "./build/packaged/[name].js",
      libraryTarget: "var",
      library: "[name]",
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'source/app/index.html',
        inject: true
      }),
      new webpack.optimize.CommonsChunkPlugin("vendor"),
      new webpack.ProvidePlugin({
        "three": "three",
        "immutable": "immutable",
        "rx-dom": 'rx-dom',
        "rx": 'rx',
        "abstracts": 'abstracts'
      }),
      new webpack.DefinePlugin({
        "process.env":{
          ASSET_DIR: JSON.stringify(process.env.ASSET_DIR),
          ASSET_HOST: JSON.stringify(process.env.ASSET_HOST),
          SOURCE_HOST: JSON.stringify(process.env.SOURCE_HOST),
          CONFIG_ENV: JSON.stringify(process.env.CONFIG_ENV),
          PIECE_SLUG: JSON.stringify(PIECE_SLUG),
          PIECE_TITLE: JSON.stringify(PIECE_TITLE),
          IS_WEBPACK: true
        }
      })
    ],
    module: {
  	  loaders: [
		    {
		      test: /\.js?$/,
		      exclude: /(node_modules|bower_components)/,
		      loader: 'babel-loader',
		      query: {
		        presets: ['es2015']
		      }
		    },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.glsl$/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }
  		]
    },
    node: {
      fs: "empty"
    },
    devServer: {
      compress: true,
      port: 8000,
      host: '0.0.0.0'
    }
}
