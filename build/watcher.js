const { watcher } = require('wsk')

const groups = [
  {
    serviceName: 'TypeScript',
    path: 'packages/**/src/**/*.ts',
    displayOptions: {
      hideChildFiles: true
    },
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
  },

  {
    serviceName: 'Test',
    path: 'packages/**/test/**/*.ts{,x}',
    displayOptions: {
      hideChildFiles: true
    },
    events: [
      {
        type: 'change',
        taskFiles: 'build/tasks/tap/test.js'
      },
      {
        type: 'add',
        taskFiles: 'build/tasks/tap/test.js'
      }
    ]
  }
]

watcher.add(groups)
