const path = require('path');
const webpack = require('webpack');


module.exports = {
    mode: 'production',
    target: 'node',
    entry: {
        app: path.join(__dirname, 'src', 'index.ts')
    },
    module: {
        rules:
            [
                {
                    test: /\.ts?$/,
                    use: 'ts-loader',
                    exclude: '/node_modules/'
                }
            ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true
    },
    externals:
    {
        sharp: 'commonjs sharp'
    },
    optimization: {
        minimize: false
    }
};
