const { cpus } = require('os')
const { notify } = require('wsk')
const { gray } = require('chalk')
const tap = require('tap')
const Parser = require('tap-parser')
const { relative } = require('../../utils/path')

tap.jobs = cpus().length

const parser = new Parser()
const stream = tap.pipe(parser)

parser.on('child', test => {
  const { name, ok } = test

  notify({
    message: 'Running tests...',
    value: name
  })

  test.on('child', test => {
    const { name } = test

    test.on('complete', ({ ok, failures }) => {
      notify({
        message: `Test ${ok ? 'passed' : 'failed'}`,
        value: name,
        display: ok ? 'success' : 'error'
      })
    })
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
