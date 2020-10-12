const path = require('path');
const HTMlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const ASSET_PATH = process.env.ASSET_PATH || 'assets/';

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'bundle.js',
        publicPath: ASSET_PATH,
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HTMlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html"
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: './src/favicon.ico'},
                {from: './src/logo192.png'},
                {from: './src/logo512.png'},
                {from: './src/manifest.json'},
                {from: './src/robots.txt'},
                {from: './src/assets/img', to: 'assets/img'},
            ]
        }),
        new MiniCssExtractPlugin({
            filename: "styles.css"
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(json|txt)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ],
    }
};
