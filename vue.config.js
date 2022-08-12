const webpack = require("webpack");

module.exports = {
    // publicPath: "./dist",
    // outputDir: "../src/main/resources/www",
    pages:{
        index: {
            entry: "./src/test/main.js",
            template: "/src/test/public/index.html",
            filename: "index.html"
        }
    },
    runtimeCompiler: true,
    configureWebpack: {
        //支持jquery
        plugins: [
            new webpack.ProvidePlugin({
                $:"jquery",
                jQuery:"jquery",
                "windows.jQuery":"jquery"
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.bpmn$/,
                    use: 'raw-loader'
                }
            ]
        },
        cache: true
    },
    parallel: true,
};
