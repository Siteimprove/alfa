const { notify } = require('wsk')
const ts = require('typescript')
const { codeFrameColumns } = require('@babel/code-frame')
const { stat, read, glob } = require('../../utils/file')

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

function snapshot (data) {
  return ts.ScriptSnapshot.fromString(data)
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

const service = ts.createLanguageService({
  getScriptFileNames () {
    return glob('packages/**/{src,test}/**/*.ts{,x}', { sync: true })
  },

  getScriptVersion (file) {
    return stat(file, { sync: true }).mtime.toString()
  },

  getScriptSnapshot (file) {
    try {
      return snapshot(read(file, { sync: true }))
    } catch (err) {
      return null
    }
  },

  getCurrentDirectory () {
    return process.cwd()
  },

  getCompilationSettings () {
    const { config } = ts.parseConfigFileTextToJson('tsconfig.json', read('tsconfig.json', { sync: true }))
    const { options } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd())

    return options
  },

  getDefaultLibFileName (options) {
    return ts.getDefaultLibFilePath(options)
  }
})

function onEvent (event, path) {
  const program = service.getProgram()
  const source = program.getSourceFile(path)
  const diagnostics = service.getSemanticDiagnostics(path)

  if (diagnostics.length === 0) {
    notify({
      message: 'Typecheck succeeded',
      value: path,
      display: 'success'
    })
  } else {
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
