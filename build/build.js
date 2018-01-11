const { notify } = require('wsk')

const { glob } = require('./utils/file')
const babel = require('./tasks/babel/transform')
const typescript = require('./tasks/typescript/check')
const locale = require('./tasks/locale/transform')

const config = {
  silent: true
}

notify({
  message: 'Build started...',
  display: ['gray']
})

glob('packages/**/*.ts{,x}')
  .then(async files => {
    for (const file of files) {
      await babel.onEvent(null, file, config)
      await typescript.onEvent(null, file, config)
    }
  })
  .then(() => notify({
    message: 'Build succeeded!',
    display: 'success'
  }))
