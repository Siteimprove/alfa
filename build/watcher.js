const { watcher } = require('wsk')

const groups = [
  {
    serviceName: 'TypeScript',
    path: 'packages/**/src/**/*.ts',
    events: [
      {
        type: 'change',
        taskFiles: 'build/tasks/babel/transform.js'
      },
      {
        type: 'add',
        taskFiles: 'build/tasks/babel/transform.js'
      }
    ]
  }
]

watcher.add(groups)
