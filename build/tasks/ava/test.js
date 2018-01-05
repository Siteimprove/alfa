const { notify } = require('wsk')
const Ava = require('ava/api')

const ava = new Ava()

async function onEvent (event, path) {
  if (/\.spec\.js?/.test(path)) {
    try {
      const result = await ava.run([path])
    } catch (err) {
      notify({
        message: 'Tests failed',
        value: path,
        display: 'error',
        error: err
      })
    }
  }
}

module.exports = { onEvent }
