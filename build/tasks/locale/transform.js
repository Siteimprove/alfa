const { notify } = require('wsk')
const { parse } = require('hjson')
const stringify = require('stringify-object')
const { base, extension } = require('../../utils/path')
const { read, write } = require('../../utils/file')

async function onEvent (event, path, options = {}) {
  const { silent } = options

  try {
    const hjson = await read(path)
    const json = parse(hjson)
    const string = stringify(json, { indent: '  ' })

    const code = `
// This file has been automatically generated from ${base(path)}.
import { Locale } from '@alfa/rule'

const locale: Locale = ${string}

export default locale
    `.trim()

    await write(extension(path, '.ts'), code + '\n')

    notify({
      message: 'Compilation succeeded',
      value: path,
      display: 'compile',
      silent
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
