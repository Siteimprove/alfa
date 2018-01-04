const { readFile } = require('fs')
const { notify } = require('wsk')
const { transform } = require('@babel/core')

const config = {
  presets: [
    '@alfa/build/babel'
  ]
}

function onEvent (event, path, options) {
  readFile(path, 'utf8', (err, code) => {
    transform(code, config, (err, result) => {
      if (err) {
        notify({
          message: 'Compilation failed',
          value: path,
          display: 'error',
          error: err
        })
      } else {
        notify({
          message: 'Compilation succeeded',
          value: path,
          display: 'compile'
        })
      }
    })
  })
}

module.exports = { onEvent }
