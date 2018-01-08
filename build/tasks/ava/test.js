const { notify } = require('wsk')
const tap = require('tap')
const Parser = require('tap-parser')
const { relative } = require('../../utils/path')

const parser = new Parser()
const stream = tap.pipe(parser)

parser.on('child', test => {
  const { name, ok } = test

  notify({
    message: `Test ${ok ? 'passed' : 'failed'}`,
    value: name,
    display: ok ? 'success' : 'error'
  })
})

async function onEvent (event, path) {
  if (/\.spec\.tsx?/.test(path)) {
    await tap.spawn('node', [
      '--require', './build/tasks/ava/environment.js',
      path
    ], path)
  }
}

module.exports = { onEvent }
