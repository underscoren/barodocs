const path = require("path");

module.exports = {
  entry: "./app-src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devtool: process.env.GENERATE_SOURCEMAP ? "eval-source-map" : undefined,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        use: [ "babel-loader" ]
      }
    ]
  }
}