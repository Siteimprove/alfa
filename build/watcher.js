const { watcher } = require('wsk')

const tasks = 'build/tasks'

const groups = [
  {
    serviceName: 'TypeScript',
    path: 'packages/**/{src,test}/**/*.ts{,x}',
    displayOptions: {
      hideChildFiles: true
    },
    events: [
      {
        type: 'change',
        taskFiles: [
          `${tasks}/babel/transform.js`,
          `${tasks}/typescript/check.js`,
          `${tasks}/tap/test.js`
        ]
      }
    ]
  }
]

watcher.add(groups)
