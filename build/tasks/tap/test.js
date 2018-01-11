const { cpus } = require('os')
const { notify } = require('wsk')
const { gray } = require('chalk')
const tap = require('tap')
const Parser = require('tap-parser')
const { read } = require('../../utils/file')
const { CodeError } = require('../../utils/error')
const nyc = require.resolve('nyc/bin/nyc')
const environment = require.resolve('./environment')

const parser = new Parser()

parser.on('child', test => {
  const { name: path } = test

  notify({
    message: 'Running tests',
    value: path,
    display: 'reload'
  })

  test.on('child', test => {
    test.on('complete', ({ ok, failures }) => {
      if (!ok) {
        notify({
          message: `Test ${ok ? 'passed' : 'failed'}`,
          value: test.name,
          display: ok ? 'success' : 'error'
        })

        const source = read(path, { sync: true })

        for (const failure of failures) {
          const { found, wanted } = failure.diag
          const { line, column } = failure.diag.at

          notify({
            message: gray('--- ') + failure.name,
            display: 'error',
            extend: {
              desktop: false
            },
            error: new CodeError(source, {
              line,
              column
            })
          })
        }
      }
    })
  })

  test.on('complete', ({ ok }) => {
    if (ok) {
      notify({
        message: `Tests ${ok ? 'passed' : 'failed'}`,
        value: path,
        display: ok ? 'success' : 'error',
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
