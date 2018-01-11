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
      },
      {
        type: 'add',
        taskFiles: [
          `${tasks}/babel/transform.js`,
          `${tasks}/typescript/check.js`,
          `${tasks}/tap/test.js`
        ]
      }
    ]
  },

  {
    serviceName: 'Locale',
    path: 'packages/**/locale/*.hjson',
    displayOptions: {
      hideChildFiles: true
    },
    events: [
      {
        type: 'change',
        taskFiles: [
          `${tasks}/locale/transform.js`
        ]
      },
      {
        type: 'add',
        taskFiles: [
          `${tasks}/locale/transform.js`
        ]
      }
    ]
  }
]

watcher.add(groups)
