# template-loader
A jsx template loader for webpack.

```javascript
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: 'template-loader',
          options: {
            funcName: 'createNode', // 默认为 createElement
            textTagName: [], // 用于显示文本的标签，默认为 text

            // 特殊属性值的 format
            // 如：foo={state.foo} 会默认被解析为 foo: state.foo
            // 设置 formatValue 可以改变解析结果
            // 如下的设置，解析结果为：foo: function(state, props, model) { return state.foo; }
            formatValue(val) {
              return `function(state, props, model) { return ${val}; }`;
            }
          },
        },
      },
    ],
  },
}

```