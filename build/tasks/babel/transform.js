const { notify } = require('wsk')
const babel = require('@babel/core')
const { read, write } = require('../../utils/file')
const { extension } = require('../../utils/path')
const { transform } = require('../../utils/babel')

const config = {
  presets: [
    '@alfa/build/babel'
  ]
}

function transform (code, options) {
  return new Promise((resolve, reject) => {
    babel.transform(code, options, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

async function onEvent (event, path) {
  try {
    const code = await read(path)
    const result = await transform(code, config)

    const out = extension(path.replace('src', 'dist'), '.js')

    await write(out, result.code)

    notify({
      message: 'Compilation succeeded',
      value: path,
      display: 'compile'
    })
  } catch (err) {
    notify({
      message: 'Compilation failed',
      value: path,
      display: 'error',
      error: err
    })
  }
}

module.exports = { onEvent }
