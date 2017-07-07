var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: __dirname + "/src/index.tsx",
    output: {
        path: __dirname + "/dist/",
        filename: "bundle.js"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title:'zhape',
            hash: true,
            filename: './index.html'
        })
        
    ]
    /*externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },*/
};