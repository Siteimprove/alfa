const { onEvent } = require('./test')
const { glob } = require('../../utils/file')

glob('packages/**/test/**/*.ts{,x}')
  .then(files => {
    for (const file of files) {
      onEvent(null, file)
    }
  })
