const { basename, dirname, extname, join } = require('path')
const through = require('through2')
const { parse } = require('hjson')
const stringify = require('stringify-object')

function extension (path, ext) {
  return join(dirname(path), basename(path, extname(path)) + ext);
}

function locale () {
  return through.obj((file, env, done) => {
    if (file.isBuffer()) {
      const json = parse(file.contents.toString('utf8'))
      const string = stringify(json, { indent: '  ' })

      const contents = `
// This file has been automatically generated from ${basename(file.path)} by @endal/build.
import { Locale } from '@endal/rule'

const locale: Locale = ${string}

export default locale
      `

      file.contents = new Buffer(contents.trim() + '\n')
      file.path = extension(file.path, '.ts')
    }

    done(null, file)
  })
}

module.exports = {
  locale
}
