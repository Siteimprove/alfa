const { cpus } = require('os')
const { notify } = require('wsk')
const { gray } = require('chalk')
const tap = require('tap')
const Parser = require('tap-parser')
const environment = require.resolve('./environment')

const parser = new Parser()

parser.on('child', test => {
  const { name, ok } = test

  notify({
    message: 'Running tests from',
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

tap.jobs = cpus().length
tap.pipe(parser)

async function onEvent (event, path) {
  if (/\.spec\.tsx?/.test(path)) {
    await tap.spawn('node', ['--require', environment, path], path)
  }
}

module.exports = { onEvent }
