const path = require('path')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: path.resolve(__dirname, 'index.jsx'),
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: './dist/index.js',
          options: {
            funcName: 'createNode',
            formatValue(val) {
              return `function(state, props, model) { return ${val}; }`;
            }
          },
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
}