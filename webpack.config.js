const path = require('path')
var webpack = require('webpack')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.CVA_PORT = process.env.CVA_PORT || process.env.PORT || 5000

const config = function (mode) {
  let conf = {
    mode: mode,
    entry: ['./src/index.js'],
    module: {
      rules: [
        {
          test: /\.(bin|json)$/i,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        },
        {
          test: /\.html$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'html-loader',
            options: {}
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.json$/
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'public/bundle/'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    plugins: [],
    devServer: {
      watchOptions: {
        ignored: /node_modules/,
        poll: true
      },
      contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'src')],
      compress: true,
      hot: true,
      port: process.env.CVA_PORT
    }
  }

  if (mode === 'development') {
    conf.plugins.push(new webpack.HotModuleReplacementPlugin())
    conf.plugins.push(new webpack.NoEmitOnErrorsPlugin())
  }

  return conf
}

module.exports = config(process.env.NODE_ENV)
