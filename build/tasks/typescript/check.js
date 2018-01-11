const { notify } = require('wsk')
const ts = require('typescript')
const { codeFrameColumns } = require('@babel/code-frame')

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

class TypeError {
  get name () {
    return 'TypeError'
  }

  get stack () {
    return this.toString()
  }

  constructor (message, file, start, end) {
    this.message = message
    this.file = file
    this.start = start
    this.end = end
  }

  toString () {
    const { name, message, file, start, end } = this

    const frame = codeFrameColumns(file, { start, end }, {
      highlightCode: true
    })

    return `${name}: ${message}\n${frame}`
  }
}

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
    return this.getModifiedTime(path)
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

function onEvent (event, path) {
  const diagnostics = service.getSemanticDiagnostics(path)

  if (diagnostics.length === 0) {
    notify({
      message: 'Typecheck succeeded',
      value: path,
      display: 'success'
    })
  } else {
    const source = service.getSourceFile(path)

    for (const { start: position, length, messageText } of diagnostics) {
      const start = location(source, position)
      const end = location(source, position + length)

      notify({
        message: 'Typecheck failed',
        value: path,
        display: 'error',
        error: new TypeError(flatten(messageText), source.text, start, end)
      })
    }
  }
}

module.exports = { onEvent }
