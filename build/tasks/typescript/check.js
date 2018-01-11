const { notify } = require('wsk')
const ts = require('typescript')
const { gray } = require('chalk')
const { stat } = require('../../utils/file')
const { resolve } = require('../../utils/path')
const { CodeError } = require('../../utils/error')

function location (file, position) {
  const { line, character } = file.getLineAndCharacterOfPosition(position)
  return {
    line: line + 1,
    column: character + 1
  }
}

function flatten (message) {
  return ts.flattenDiagnosticMessageText(message, '\n')
}

const versions = new Map()

class Project {
  constructor (config = 'tsconfig.json') {
    if (typeof config === 'string') {
      config = ts.parseConfigFileTextToJson(config, ts.sys.readFile(config, 'utf8')).config
    }

    Object.assign(this, ts.sys)

    this.config = ts.parseJsonConfigFileContent(config, this, this.getCurrentDirectory())
  }

  getScriptFileNames () {
    return this.config.fileNames
  }

  getScriptVersion (path) {
    return versions.get(path)
  }

  getScriptSnapshot (path) {
    try {
      return ts.ScriptSnapshot.fromString(this.readFile(path))
    } catch (err) {
      return null
    }
  }

  getCompilationSettings () {
    return this.config.options
  }

  getDefaultLibFileName (options) {
    return ts.getDefaultLibFilePath(options)
  }
}

const service = ts.createLanguageService(new Project())

async function onEvent (event, path) {
  const { mtime } = await stat(path)

  versions.set(resolve(path), mtime.toString())

  const diagnostics = service.getSemanticDiagnostics(path)
  const ok = diagnostics.length === 0

  notify({
    message: `Typecheck ${ok ? 'succeeded' : 'failed'}`,
    value: path,
    display: ok ? 'success' : 'error'
  })

  if (!ok) {
    const source = service.getSourceFile(path)

    for (const { code, start: position, length, messageText } of diagnostics) {
      const start = location(source, position)
      const end = location(source, position + length)
      const { text } = source

      notify({
        message: gray('--- ') + flatten(messageText),
        display: 'error',
        error: new CodeError(text, start, end)
      })
    }
  }
}

module.exports = { onEvent }
