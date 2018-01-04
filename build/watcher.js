const { watcher } = require('wsk')

const groups = [
  {
    serviceName: 'TypeScript',
    path: 'packages/**/src/**/*.ts',
    events: [
      {
        type: 'change',
        taskFiles: 'build/tasks/babel.js'
      }
    ]
  }
]

watcher.add(groups, (err, trees) => {
  if (err) {
    console.error(err)
  }
})
