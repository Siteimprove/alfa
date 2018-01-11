const { cpus } = require('os')
const { notify } = require('wsk')
const { gray, reset } = require('chalk')
const tap = require('tap')
const Parser = require('tap-parser')
const { read } = require('../../utils/file')
const { CodeError } = require('../../utils/error')
const nyc = require.resolve('nyc/bin/nyc')
const environment = require.resolve('./environment')

const parser = new Parser()

parser.on('child', test => {
  const { name: path } = test
  const results = []

  test.on('child', test => {
    test.on('complete', ({ ok, failures }) => {
      if (!ok) {
        results.push({ name: test.name, failures })
      }
    })
  })

  test.on('complete', async ({ ok }) => {
    if (ok) {
      notify({
        message: 'Tests passed',
        value: path,
        display: 'success'
      })
    } else {
      const source = await read(path)

      for (const { name, failures } of results) {
        notify({
          message: `Test ${ok ? 'passed' : 'failed'}`,
          value: `${path} ${reset.dim(name)}`,
          display: ok ? 'success' : 'error',
        })

        for (const { name, diag } of failures) {
          const { line, column } = diag.at

          notify({
            message: `${gray('---')} ${name}`,
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
