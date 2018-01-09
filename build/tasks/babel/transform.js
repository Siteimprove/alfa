const { notify } = require('wsk')
const babel = require('@babel/core')
const { read, write } = require('../../utils/file')
const { extension } = require('../../utils/path')

const config = {
  presets: [
    '@alfa/build/babel'
  ],
  sourceMaps: 'inline',
  sourceRoot: process.cwd(),
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
    const result = await transform(code, { ...config, filename: path })

    const out = path.replace('/src/', '/dist/')

    await write(extension(out, '.js'), result.code)

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
