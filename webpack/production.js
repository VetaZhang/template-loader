const path = require('path')

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'development',
  
  // 打包输出 ESM 格式文件，最终要输出多个文件，便于实现按需加载，因此设置为多入口。
  entry: './src/index.ts',
  
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    library: {
      type: 'module'
    },
    chunkFormat: 'module',
    clean: true
  },

  // 由于输出 ESM 格式文件为 Webpack 实验特性，因此需要加上此配置。
  experiments: {
    outputModule: true
  },

  resolve: {
    extensions: ['.js', '.json', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']]
            }
          },
          { loader: 'ts-loader' }
        ]
      }
    ]
  }
}

module.exports = config