const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.[contenthash].js',
    clean: true, // 在生成文件之前清空输出目录
  },
  
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    port: 5173, // 前端开发服务器端口
    hot: true,
    open: true,
    historyApiFallback: true, // 支持React Router
    proxy: {
      '/api': {
        target: 'http://localhost:8003', // 后端服务器地址
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8003',
        ws: true, // 启用websocket代理
      }
    }
  },
  
  mode: 'development',
};