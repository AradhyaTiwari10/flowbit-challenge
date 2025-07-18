const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        supportTicketsApp: 'supportTicketsApp@http://localhost:3001/remoteEntry.js',
        adminDashboard: 'adminDashboard@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.20.1',
        },
        axios: {
          singleton: true,
          requiredVersion: '^1.6.2',
        },
        'react-query': {
          singleton: true,
          requiredVersion: '^3.39.3',
        },
        'react-hook-form': {
          singleton: true,
          requiredVersion: '^7.48.2',
        },
        'react-hot-toast': {
          singleton: true,
          requiredVersion: '^2.4.1',
        },
        'lucide-react': {
          singleton: true,
          requiredVersion: '^0.294.0',
        },
        clsx: {
          singleton: true,
          requiredVersion: '^2.0.0',
        },
        'tailwind-merge': {
          singleton: true,
          requiredVersion: '^2.0.0',
        },
        date-fns: {
          singleton: true,
          requiredVersion: '^2.30.0',
        },
        zustand: {
          singleton: true,
          requiredVersion: '^4.4.7',
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Flowbit - Multi-Tenant Workflow System',
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
}; 