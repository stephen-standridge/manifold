var webpack = require('webpack');
var pjson = require('../package.json');

module.exports = {
    entry: {
      constructor: "./source/core/index.js"
    },
    output: {
      filename: "index.js",
      libraryTarget: "commonjs2",
      library: "Manifold"
    },
    externals: {
      "three": "three",
      "immutable": "immutable",
      "rx": "rx",
      "rx-dom": 'rx-dom',
      "abstracts": "abstracts"
    },
    plugins: [

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
        }
      ]
    },
    cache: false,
    node: {
      fs: "empty"
    }
}
