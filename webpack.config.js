const path = require('path');
const HTMlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

module.exports = {
    entry: {
        main: "./src/js/index.js",
        dashboard: "./src/js/dashboard.js"
    },
    output: {
        filename: '[name].bundle.js',
        publicPath: "/",
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: '[id].bundle_[chunkhash].js',
        sourceMapFilename: '[file].map'
    },
    plugins: [
        new HTMlWebpackPlugin({
            title: "Login - WeatherLink",
            filename: "index.html",
            template: "./src/index.html",
            chunks: ['main']
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: './src/favicon.ico'},
                {from: './src/logo192.png'},
                {from: './src/logo512.png'},
                {from: './src/manifest.json'},
                {from: './src/robots.txt'},
                {from: './src/assets/img', to: 'assets/img'},
                {from: './src/pages/modals/nueva-estacion-modal.html', to:"nueva-estacion-modal-"},
                {from: './src/pages/modals/editar-estacion-modal.html', to:"editar-estacion-modal.html"}
            ]
        }),
        new MiniCssExtractPlugin({
            filename: "styles.css"
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new HTMlWebpackPlugin({
            title: "Dashboard - WeatherLink",
            filename: "dashboard.html",
            template: "./src/pages/dashboard.html",
            chunks: ['dashboard']
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(dotenv.config().parsed)
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
    },
};
