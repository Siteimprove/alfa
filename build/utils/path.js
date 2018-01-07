const { basename, dirname, extname, relative, join } = require('path')

function base (path, extension) {
  return extension ? basename(path) : basename(path, extname(path))
}

function directory (path) {
  return dirname(path)
}

function extension (path, extension) {
  const ext = extname(path)

  if (extension === undefined) {
    return ext
  }

  return join(directory(path), base(path, false) + extension)
}

module.exports = { base, directory, extension, relative }
