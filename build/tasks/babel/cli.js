const { onEvent } = require('./transform')
const { glob } = require('../../utils/file')

glob('packages/**/src/**/*.ts')
  .then(files => {
    for (const file of files) {
      onEvent(null, file)
    }
  })
