const { extname, basename, dirname, join } = require('path')

function extension (path, extension) {
  const ext = extname(path)

  if (extension === undefined) {
    return ext
  }

  const dir = dirname(path)
  const base = basename(path, ext)

  return join(dir, base + extension)
}

module.exports = { extension }
