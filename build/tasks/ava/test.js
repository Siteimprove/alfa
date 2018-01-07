const { notify } = require('wsk')
const tap = require('tap')
const reporter = require('tap-mocha-reporter')
const register = require('@babel/register')
const { relative } = require('../../utils/path')

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

async function onEvent (event, path) {
  tap.pipe(reporter('spec'))

  if (/\.spec\.tsx?/.test(path)) {
    notify({
      message: 'Testing',
      value: path
    })

    require(relative(__dirname, `${path}`))
  }
}

module.exports = { onEvent }
