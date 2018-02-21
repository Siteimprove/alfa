require("@alfa/jsx/register");

require("@babel/register")({
  presets: ["module:@alfa/babel"],
  ignore: [
    "node_modules",

    // Don't compile our Babel preset as this would cause a recursion error.
    "packages/babel/index.js"
  ],
  extensions: [".js", ".jsx", ".ts", ".tsx"]
});
