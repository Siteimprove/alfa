import { basename, dirname, extname, join } from 'path'
import through from 'through2'
import { parse } from 'hjson'
import stringify from 'stringify-object'

export const browsers = [
  'chrome >= 55',
  'edge >= 15',
  'firefox >= 55',
  'opera >= 48',
  'safari >= 10.1'
]

function extension (path: string, ext: string): string {
  return join(dirname(path), basename(path, extname(path)) + ext);
}

export function locale () {
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
