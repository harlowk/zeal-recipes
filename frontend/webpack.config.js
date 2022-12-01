const HtmlWebpackPlugin = require("html-webpack-plugin")
const PnpWebpackPlugin = require("pnp-webpack-plugin")
const path = require("path")

const webpack = require("webpack")

const staticDir = path.resolve(__dirname, "static")
const buildDir = path.resolve(__dirname, "dist")
const buildTemplate = path.resolve(staticDir, "index-template.html")
const srcDir = path.resolve(__dirname, "src")
const entryPoint = path.resolve(__dirname, "src", "index.js")

const usingDocker = true;

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    main: entryPoint,
  },
  devtool: "eval-source-map",
  resolve: {
    extensions: [".js", ".json"],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  output: {
    path: buildDir,
    filename: "[name].bundle.js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [srcDir],
        loader: require.resolve("esbuild-loader"),
        options: {
          loader: "jsx",
          target: "es2018",
        },
      },
    ],
  },
  devServer: {
    // Docker seems to want the internal container address to be 0.0.0.0 and not localhost, which is the default string for webpack.
    host: usingDocker ? "0.0.0.0" : "",
    port: 3000,
    contentBase: staticDir,
    historyApiFallback: true,
    publicPath: "/",
    filename: "[name].bundle.js",
    proxy: {
      "/api/**": {
        target: usingDocker ? "http://0.0.0.0:4000" : "http://localhost:4000",
        changeOrigin: true,
      },
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "what can you make",
      template: buildTemplate,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
