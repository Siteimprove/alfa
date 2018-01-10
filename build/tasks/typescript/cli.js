const { onEvent } = require('./check')
const { glob } = require('../../utils/file')

glob('packages/**/{src,test}/**/*.ts{,x}')
  .then(files => {
    for (const file of files) {
      onEvent(null, file)
    }
  })
