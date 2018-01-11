const { onEvent } = require('./transform')
const { glob } = require('../../utils/file')

glob('packages/**/locale/*.hjson')
  .then(files => {
    for (const file of files) {
      onEvent(null, file)
    }
  })
