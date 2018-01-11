const { cpus } = require('os')
const { notify } = require('wsk')
const { gray } = require('chalk')
const tap = require('tap')
const Parser = require('tap-parser')
const nyc = require.resolve('nyc/bin/nyc')
const environment = require.resolve('./environment')

const parser = new Parser()

parser.on('child', test => {
  notify({
    message: 'Running tests',
    value: test.name
  })

  test.on('child', test => {
    test.on('complete', ({ ok, failures }) => {
      if (!ok) {
        notify({
          message: `Test ${ok ? 'passed' : 'failed'}`,
          value: test.name,
          display: ok ? 'success' : 'error'
        })
      }
    })
  })

  test.on('complete', ({ ok }) => {
    if (ok) {
      notify({
        message: `Tests ${ok ? 'passed' : 'failed'}`,
        display: ok ? 'success' : 'error'
      })
    }
  })
})

tap.jobs = cpus().length
tap.pipe(parser)

async function onEvent (event, path) {
  if (/\.spec\.tsx?/.test(path)) {

    await tap.spawn(nyc, [
      '--silent',
      '--cache',
      '--',
      'node',
      '--require', environment,
      path
    ], path)
  }
}

module.exports = { onEvent }
