const { notify } = require('wsk')
const { createProgram, createTypeChecker, flattenDiagnosticMessageText } = require('typescript')
const { codeFrameColumns } = require('@babel/code-frame')
const { read } = require('../../utils/file')
const { compilerOptions } = require('../../../tsconfig.json')

function location (file, position) {
  const { line, character } = file.getLineAndCharacterOfPosition(position)
  return {
    line: line + 1,
    column: character + 1
  }
}

function flatten (message) {
  return flattenDiagnosticMessageText(message, '\n')
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

async function onEvent (event, path) {
  const program = createProgram([path], compilerOptions)
  const checker = createTypeChecker(program, true)

  const source = program.getSourceFile(path)
  const diagnostics = checker.getDiagnostics(source)

  if (diagnostics.length === 0) {
    notify({
      message: 'Checking succeeded',
      value: path,
      display: 'success'
    })
  } else {
    const group = notify.group()

    for (const { file, start: position, length, messageText } of diagnostics) {
      const start = location(source, position)
      const end = location(source, position + length)

      group.add({
        message: 'Checking failed',
        value: path,
        display: 'error',
        error: new TypeError(flatten(messageText), file.text, start, end)
      })
    }

    group.notify()
  }
}

module.exports = { onEvent }
