var path = require("path");

module.exports = {
  entry: {
    app: [
      './elm/index.js'
    ]
  },

  output: {
    path: path.resolve(__dirname + '/public/js'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test:    /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        loader:  'elm-webpack',
      }
    ],

    noParse: /\.elm$/,
  },

  devServer: {
    inline: true,
    stats: { colors: true },
  },
};
