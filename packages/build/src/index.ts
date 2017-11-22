import { basename, dirname, extname, join } from 'path'
import through from 'through2'
import { parse } from 'hjson'
import stringify from 'stringify-object'

function extension (path: string, ext: string): string {
  const file = basename(path, extname(path)) + ext;
  return join(dirname(path), file);
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
