const register = require('@babel/register')

require('@alfa/jsx/register')

register({
  presets: [
    '@alfa/build/babel'
  ],
  ignore: [
    'node_modules',

    // Don't compile our Babel preset as this would cause a recursion error.
    'packages/build/babel.js'
  ],
  extensions: [
    '.js',
    '.jsx',
    '.ts',
    '.tsx'
  ]
})
