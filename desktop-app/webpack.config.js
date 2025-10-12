// desktop-app/webpack.config.js - UPDATE YOUR ENTRY SECTION

const path = require('path');

module.exports = {
    mode: 'development',

    entry: {
        petRenderer: './src/petRenderer.jsx',
        popupRenderer: './src/popupRenderer.jsx',
        conversationRenderer: './src/conversationRenderer.jsx',
        index: './src/index.css'
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.jsx']
    }
};